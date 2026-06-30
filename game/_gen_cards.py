#!/usr/bin/env python3
"""Batch generate card images using sn-image-generate."""
import subprocess
import json
import os
import time

BASE_DIR = r"G:\Hermes项目\card-game-design\game\assets\cards"
SCRIPT = r"C:\Users\安安\AppData\Local\hermes\skills\sn-image-base\scripts\sn_agent_runner.py"

# Card definitions with unique descriptions
CARDS = [
    (1, "刘裕", "宋", " infantry", "南朝宋武帝，英武统帅，身披重甲，手持长矛，骑战马，背景旌旗飘扬"),
    (2, "檀道济", "宋", " infantry", "南朝宋名将，唱筹量沙，中年将军，面容坚毅，手持长矛，沙场点兵"),
    (3, "沈庆之", "宋", " infantry", "南朝宋老将，白发苍苍，拄长戟，身经百战，铠甲有旧裂痕"),
    (4, "到彦之", "宋", " infantry", "南朝宋大将，军令如山，直立威严，右手举令牌，左手按剑"),
    (5, "谢晦", "宋", " strategy", "南朝宋谋士，文人侧立，手持羽扇，儒冠长袍，腰带玉佩"),
    (6, "萧道成", "齐", " infantry", "齐高帝，帝王正面，冕旒冠，双手持天子剑，龙纹金腰带"),
    (7, "王俭", "齐", " strategy", "齐代谋士，双手各持一封书信，离间计，地面分裂"),
    (8, "褚渊", "齐", " strategy", "齐代书生，捧卷阅读，竹简展开，地上散落简册"),
    (9, "崔祖思", "齐", " infantry", "齐代武将，前倾战斗姿态，双手握大刀，披风后飘"),
    (10, "王僧虔", "齐", " cavalry", "齐代书法名士，宽袖挥毫，大毛笔，墨迹飞溅"),
]

def generate_image(card_id, name, faction, card_type, description):
    output_path = os.path.join(BASE_DIR, f"card_{card_id:03d}.png")
    
    prompt = f"""Chinese ink-wash painting style card illustration, {description}, 
faction: {faction}, type: {card_type}. 
Style: black and white ink wash, traditional Chinese painting, 
dynamic composition, transparent background, 
high contrast, brush stroke texture, 
no text, no UI elements, just the character illustration"""
    
    cmd = [
        "python", SCRIPT, "sn-image-generate",
        "--prompt", prompt,
        "--image-size", "2k",
        "--aspect-ratio", "3:4",
        "--save-path", output_path,
        "--api-key", os.environ.get("SN_API_KEY", ""),
        "--base-url", "https://token.sensenova.cn/v1"
    ]
    
    print(f"Generating card {card_id}: {name}...")
    try:
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=120)
        if result.returncode == 0:
            print(f"  ✓ Success: {output_path}")
            return True
        else:
            print(f"  ✗ Failed: {result.stderr[:200]}")
            return False
    except subprocess.TimeoutExpired:
        print(f"  ✗ Timeout after 120s")
        return False
    except Exception as e:
        print(f"  ✗ Error: {e}")
        return False

if __name__ == "__main__":
    success = 0
    failed = 0
    
    for card_id, name, faction, card_type, desc in CARDS:
        if generate_image(card_id, name, faction, card_type, desc):
            success += 1
        else:
            failed += 1
        time.sleep(2)  # Avoid rate limit
    
    print(f"\nBatch complete: {success} success, {failed} failed")
