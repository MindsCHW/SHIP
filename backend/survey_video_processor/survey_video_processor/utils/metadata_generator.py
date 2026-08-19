import pandas as pd
import os
from typing import List, Dict, Any
import logging

logger = logging.getLogger(__name__)

def generate_metadata_csv(records: List[Dict[str, Any]], output_dir: str) -> pd.DataFrame:
    """
    Generates the frame_metadata.csv file from the updated records.
    """
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)
        
    # Format according to user request:
    # Frame Name, Timestamp, Latitude, Longitude, Speed, Chainage
    data = []
    for record in records:
        data.append({
            'Frame Name': record.get('frame_name', ''),
            'Timestamp': record.get('start_time', ''),
            'Latitude': record.get('latitude', ''),
            'Longitude': record.get('longitude', ''),
            'Speed': record.get('speed', ''),
            'Chainage': record.get('chainage', '')
        })
        
    df = pd.DataFrame(data)
    csv_path = os.path.join(output_dir, 'frame_metadata.csv')
    df.to_csv(csv_path, index=False)
    
    logger.info(f"Metadata saved to {csv_path}")
    return df
