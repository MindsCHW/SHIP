import streamlit as st
import os
import tempfile
import pandas as pd
from PIL import Image

from utils.vtt_parser import parse_vtt
from utils.frame_extractor import extract_frames
from utils.metadata_generator import generate_metadata_csv

st.set_page_config(page_title="Survey Video Processor", layout="wide")

def main():
    st.title("Survey Video Processor")
    
    st.markdown("### Upload Files")
    
    col1, col2 = st.columns(2)
    with col1:
        video_file = st.file_uploader("Upload Survey Video (.mp4)", type=["mp4"])
    with col2:
        vtt_file = st.file_uploader("Upload Survey Metadata (.vtt)", type=["vtt"])
        
    if video_file and vtt_file:
        if st.button("Process"):
            with st.spinner("Processing Progress..."):
                try:
                    # Setup output paths
                    base_dir = os.path.dirname(os.path.abspath(__file__))
                    output_dir = os.path.join(base_dir, 'output')
                    frames_dir = os.path.join(output_dir, 'frames')
                    
                    if not os.path.exists(frames_dir):
                        os.makedirs(frames_dir)
                    
                    # 1. Read VTT file
                    vtt_content = vtt_file.getvalue().decode("utf-8")
                    records = parse_vtt(vtt_content)
                    
                    if not records:
                        st.error("No valid records found in the VTT file.")
                        return
                    
                    # 2. Save video to a temporary file for OpenCV to read
                    with tempfile.NamedTemporaryFile(delete=False, suffix=".mp4") as tmp_video:
                        tmp_video.write(video_file.read())
                        tmp_video_path = tmp_video.name
                    
                    # 3. Extract frames
                    updated_records = extract_frames(tmp_video_path, records, frames_dir)
                    
                    # 4. Generate Metadata CSV
                    df = generate_metadata_csv(updated_records, output_dir)
                    
                    # Clean up temporary video
                    try:
                        os.remove(tmp_video_path)
                    except Exception as e:
                        pass
                    
                    # 5. Display Results
                    st.success("✔ Processing Completed Successfully!")
                    
                    # Create ZIP file immediately and offer download button
                    import shutil
                    zip_path = os.path.join(output_dir, 'frames')
                    shutil.make_archive(zip_path, 'zip', frames_dir)
                    
                    st.markdown("### Download")
                    with open(zip_path + ".zip", "rb") as f:
                        st.download_button(
                            label="📦 Download all frames folder (.zip)",
                            data=f,
                            file_name="frames.zip",
                            mime="application/zip"
                        )
                    
                    st.markdown("---")
                    
                    col_res1, col_res2 = st.columns(2)
                    with col_res1:
                        st.metric("✔ Number of Frames Extracted", len(updated_records))
                    with col_res2:
                        st.metric("✔ Number of Metadata Records", len(updated_records))
                        
                    st.markdown("### First Few Extracted Frames Preview")
                    # Show up to 3 frames
                    preview_records = updated_records[:3]
                    cols = st.columns(len(preview_records) if len(preview_records) > 0 else 1)
                    
                    for idx, record in enumerate(preview_records):
                        if 'frame_name' in record:
                            frame_path = os.path.join(frames_dir, record['frame_name'])
                            if os.path.exists(frame_path):
                                img = Image.open(frame_path)
                                # use_column_width is deprecated, use use_container_width
                                cols[idx].image(img, caption=record['frame_name'], use_container_width=True)
                        
                except Exception as e:
                    st.error(f"An error occurred during processing: {str(e)}")

if __name__ == "__main__":
    main()
