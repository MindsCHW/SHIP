import re
from typing import List, Dict, Any
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def parse_vtt(vtt_content: str) -> List[Dict[str, Any]]:
    """
    Parses a VTT string and returns a list of dictionaries with extracted metadata.
    
    Expected format:
    00:00:00.000 --> 00:00:00.757
    Lat: 9.844985, Lon: 78.0118833, Speed: 19.44Km/hr chainage: 18.80
    """
    records = []
    
    blocks = re.split(r'\n\s*\n', vtt_content.strip())
    
    timestamp_pattern = re.compile(r'(\d{2}:\d{2}:\d{2}\.\d{3})\s*-->\s*(\d{2}:\d{2}:\d{2}\.\d{3})')
    metadata_pattern = re.compile(r'Lat:\s*([0-9.-]+),\s*Lon:\s*([0-9.-]+),\s*Speed:\s*([0-9.-]+)\s*[kK]m/hr\s*chainage:\s*([0-9.-]+)', re.IGNORECASE)

    for block in blocks:
        if '-->' not in block:
            continue
            
        timestamp_match = timestamp_pattern.search(block)
        metadata_match = metadata_pattern.search(block)
        
        if timestamp_match and metadata_match:
            start_time = timestamp_match.group(1)
            end_time = timestamp_match.group(2)
            lat = float(metadata_match.group(1))
            lon = float(metadata_match.group(2))
            speed = float(metadata_match.group(3))
            chainage = float(metadata_match.group(4))
            
            records.append({
                'start_time': start_time,
                'end_time': end_time,
                'latitude': lat,
                'longitude': lon,
                'speed': speed,
                'chainage': chainage
            })
        else:
            logger.warning(f"Could not parse block: {block.strip()}")
            
    return records
