import argparse
import json
import os
import sys

from utils.vtt_parser import parse_vtt
from utils.frame_extractor import extract_frames, time_to_msec

def msec_to_time_str(msec: float) -> str:
    total_seconds = msec / 1000.0
    hours = int(total_seconds // 3600)
    minutes = int((total_seconds % 3600) // 60)
    seconds = total_seconds % 60
    return f"{hours:02d}:{minutes:02d}:{seconds:06.3f}"

def main():
    parser = argparse.ArgumentParser(description="Extract frames for specific chainages")
    parser.add_argument("--video", required=True, help="Path to the video file")
    parser.add_argument("--vtt", required=True, help="Path to the VTT file")
    parser.add_argument("--outdir", required=True, help="Path to the output directory")
    parser.add_argument("--chainages", required=True, help="Comma separated list of chainages")
    
    args = parser.parse_args()
    
    try:
        target_chainages = [float(c.strip()) for c in args.chainages.split(',') if c.strip()]
    except ValueError as e:
        print(json.dumps({"error": f"Invalid chainage format: {str(e)}"}))
        sys.exit(1)
        
    try:
        with open(args.vtt, 'r', encoding='utf-8') as f:
            vtt_content = f.read()
    except Exception as e:
        print(json.dumps({"error": f"Failed to read VTT file: {str(e)}"}))
        sys.exit(1)
        
    records = parse_vtt(vtt_content)
    
    if not records:
        print(json.dumps({"error": "No valid VTT records found in file."}))
        sys.exit(1)
        
    # Sort records by chainage just in case
    records.sort(key=lambda x: x['chainage'])
    
    min_chainage = records[0]['chainage']
    max_chainage = records[-1]['chainage']
    
    target_records = []
    
    for target in target_chainages:
        # Check bounds
        if target < min_chainage or target > max_chainage:
            target_records.append({
                "target_chainage": target,
                "error": f"Timestamp outside VTT coverage bounds ({min_chainage} - {max_chainage})."
            })
            continue
            
        # Exact match
        exact_match = next((r for r in records if abs(r['chainage'] - target) < 0.0001), None)
        if exact_match:
            record_copy = exact_match.copy()
            record_copy["target_chainage"] = target
            target_records.append(record_copy)
            continue
            
        # Interpolate
        left_record = max((r for r in records if r['chainage'] <= target), key=lambda x: x['chainage'])
        right_record = min((r for r in records if r['chainage'] >= target), key=lambda x: x['chainage'])
        
        c1, c2 = left_record['chainage'], right_record['chainage']
        fraction = (target - c1) / (c2 - c1) if c2 != c1 else 0
        
        t1 = time_to_msec(left_record['start_time'])
        t2 = time_to_msec(right_record['start_time'])
        target_t = t1 + fraction * (t2 - t1)
        
        target_records.append({
            "target_chainage": target,
            "chainage": target,
            "start_time": msec_to_time_str(target_t),
            "end_time": msec_to_time_str(target_t + 1000),
            "latitude": left_record['latitude'] + fraction * (right_record['latitude'] - left_record['latitude']),
            "longitude": left_record['longitude'] + fraction * (right_record['longitude'] - left_record['longitude']),
            "speed": left_record['speed'] + fraction * (right_record['speed'] - left_record['speed']),
            "interpolated": True
        })
        
    valid_records = [r for r in target_records if "error" not in r]

    try:
        updated_records = extract_frames(args.video, valid_records, args.outdir)
        
        # Merge updated valid records with error records
        final_records = []
        for tr in target_records:
            if "error" in tr:
                final_records.append(tr)
            else:
                extracted = next((ur for ur in updated_records if ur.get('target_chainage') == tr['target_chainage']), tr)
                final_records.append(extracted)
                
        result = {
            "success": True,
            "total_requested": len(target_chainages),
            "total_extracted": len([r for r in final_records if "frame_name" in r]),
            "records": final_records
        }
        
        results_path = os.path.join(args.outdir, 'results.json')
        with open(results_path, 'w', encoding='utf-8') as f:
            json.dump(result, f, indent=2)
            
        print(json.dumps({"success": True, "results_path": results_path}))
        
    except Exception as e:
        print(json.dumps({"error": f"Extraction failed: {str(e)}"}))
        sys.exit(1)

if __name__ == "__main__":
    main()
