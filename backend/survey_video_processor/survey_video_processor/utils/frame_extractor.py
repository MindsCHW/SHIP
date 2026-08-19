import cv2
import os
import logging
from typing import List, Dict, Any

logger = logging.getLogger(__name__)

def time_to_msec(time_str: str) -> float:
    """
    Converts a time string like '00:00:00.000' to milliseconds.
    """
    parts = time_str.split(':')
    hours = int(parts[0])
    minutes = int(parts[1])
    seconds = float(parts[2])
    
    total_seconds = (hours * 3600) + (minutes * 60) + seconds
    return total_seconds * 1000

def extract_frames(video_path: str, records: List[Dict[str, Any]], output_dir: str) -> List[Dict[str, Any]]:
    """
    Extracts one frame for each VTT record start time.
    Returns the records with the frame filename added.
    """
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)
        
    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        logger.error(f"Error opening video stream or file: {video_path}")
        raise ValueError(f"Could not open video: {video_path}")
        
    fps = cap.get(cv2.CAP_PROP_FPS)
    frame_count = cap.get(cv2.CAP_PROP_FRAME_COUNT)
    video_duration_msec = (frame_count / fps) * 1000 if fps > 0 else 0
    
    updated_records = []
    
    for i, record in enumerate(records):
        start_time_msec = time_to_msec(record['start_time'])
        
        new_record = record.copy()
        
        # Format video duration nicely
        if video_duration_msec > 0:
            total_seconds = video_duration_msec / 1000.0
            h = int(total_seconds // 3600)
            m = int((total_seconds % 3600) // 60)
            s = total_seconds % 60
            new_record['video_duration'] = f"{h:02d}:{m:02d}:{s:06.3f}"
        
        if video_duration_msec > 0 and start_time_msec > video_duration_msec:
            new_record['error'] = f"Calculated timestamp ({record['start_time']}) is outside the video duration ({new_record.get('video_duration', 'Unknown')})."
            updated_records.append(new_record)
            continue
        
        # Frame-accurate seeking:
        # OpenCV CAP_PROP_POS_MSEC seeks to the nearest keyframe (often seconds off in MP4s)
        # We seek to 2 seconds before target, then read frames until we hit the exact millisecond
        seek_time_msec = max(0, start_time_msec - 2000)
        cap.set(cv2.CAP_PROP_POS_MSEC, seek_time_msec)
        
        ret = False
        frame = None
        
        while True:
            ret_temp, frame_temp = cap.read()
            if not ret_temp:
                break
                
            current_msec = cap.get(cv2.CAP_PROP_POS_MSEC)
            frame = frame_temp
            ret = True
            
            # Stop reading once we reach or slightly exceed our target time
            if current_msec >= start_time_msec:
                break
                
        if ret and frame is not None:
            text = f"Lat: {record.get('latitude', '')}, Lon: {record.get('longitude', '')}, Speed: {record.get('speed', '')}Km/hr chainage: {record.get('chainage', '')}"
            
            font = cv2.FONT_HERSHEY_SIMPLEX
            font_scale = 0.8
            font_thickness = 2
            
            text_size, _ = cv2.getTextSize(text, font, font_scale, font_thickness)
            text_w, text_h = text_size
            
            height, width, _ = frame.shape
            x = (width - text_w) // 2
            y = height - 30
            
            padding = 10
            top_left = (x - padding, y - text_h - padding)
            bottom_right = (x + text_w + padding, y + padding)
            
            cv2.rectangle(frame, top_left, bottom_right, (0, 0, 0), -1)
            cv2.putText(frame, text, (x, y), font, font_scale, (255, 255, 255), font_thickness, cv2.LINE_AA)
            
            chainage_val = record.get('target_chainage', record.get('chainage', i + 1))
            frame_filename = f"frame_{chainage_val}.jpg"
            frame_path = os.path.join(output_dir, frame_filename)
            
            # Prevent overwriting if multiple frames have the exact same chainage
            counter = 1
            while os.path.exists(frame_path):
                frame_filename = f"frame_{chainage_val}_{counter}.jpg"
                frame_path = os.path.join(output_dir, frame_filename)
                counter += 1
                
            cv2.imwrite(frame_path, frame)
            
            new_record['frame_name'] = frame_filename
            updated_records.append(new_record)
        else:
            new_record['error'] = f"FFmpeg extraction failed: Could not read frame at {record['start_time']}"
            logger.warning(new_record['error'])
            updated_records.append(new_record)
            
    cap.release()
    return updated_records
