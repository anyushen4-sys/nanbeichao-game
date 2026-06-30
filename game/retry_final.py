#!/usr/bin/env python3
"""Final retry for stubborn cards - one by one, max timeout."""
import subprocess, json, os, time

BASE_DIR = r"G:\Hermes项目\card-game-design\assets\cards"
SCRIPT = r"C:\Users\安安\AppData\Local\hermes\skills\sn-image-base\scripts\sn_agent_runner.py"

# Still failed after 2 tries
STUBBORN = [
    (13, "陈庆之", "liang", "cavalry", "白袍战神，白衣白马，手持银枪，英武不凡，南朝名将"),
    (31, "宇文泰", "xiwei", "infantry", "西魏大冢宰，八柱国之首，威严统帅，手持虎符"),
    (101, "民兵", "common", "infantry", "保家卫国的民兵，手持简陋长矛，布衣裹身，朴实无华"),
    (115, "奇袭", "xiwei", "cavalry", "奇袭敌后，持刀骑马突击，偷袭姿态"),
    ("L1", "宋武帝刘裕", "song", "leader", "宋武帝刘裕，南朝宋开国皇帝，英武帝王，冕冠龙袍，正面帝王像"),
    ("L3", "梁武帝萧衍", "liang", "leader", "梁武帝萧衍，南朝梁开国皇帝，崇佛帝王，冕冠手持佛珠，正面帝王像"),
    ("L4", "陈武帝陈霸先", "chen", "leader", "陈武帝陈霸先，南朝陈开国皇帝，雄武帝王，铠甲龙袍，正面帝王像"),
    ("L8", "北齐文宣帝高洋", "beiqi", "leader", "北齐文宣帝高洋，狂放帝王，冕冠不整，豪放不羁，正面帝王像"),
]

# Simple prompts - fewer words, clearer structure
PROMPTS = {
    13: "黑白水墨画，卡牌插画，陈庆之，白衣白袍白马的战神武将，手持银枪，马踏飞燕，英姿飒爽，水墨笔触，透明背景",
    31: "黑白水墨画，卡牌插画，宇文泰，西魏统帅，八柱国首领，身穿铠甲，手持虎符，威严端正，水墨笔触，透明背景",
    101: "黑白水墨画，卡牌插画，民兵，古代平民士兵，手持简陋长矛，身穿布衣，表情朴实坚定，水墨笔触，透明背景",
    115: "黑白水墨画，卡牌插画，奇袭，骑兵偷袭敌后，骑战马持刀突击，动态十足，水墨笔触，透明背景",
    "L1": "黑白水墨画，卡牌肖像，宋武帝刘裕，南朝宋开国皇帝，冕冠龙袍，帝王正面像，水墨笔触，透明背景",
    "L3": "黑白水墨画，卡牌肖像，梁武帝萧衍，南朝梁开国皇帝，崇佛帝王，冕冠手持佛珠，帝王正面像，水墨笔触，透明背景",
    "L4": "黑白水墨画，卡牌肖像，陈武帝陈霸先，南朝陈开国皇帝，铠甲龙袍，帝王正面像，水墨笔触，透明背景",
    "L8": "黑白水墨画，卡牌肖像，北齐文宣帝高洋，狂放帝王，冕冠，豪放不羁，帝王正面像，水墨笔触，透明背景",
}

for i, (cid, name, faction, row, keywords) in enumerate(STUBBORN):
    prompt = PROMPTS[cid]
    if isinstance(cid, str):
        save_name = f"leader_{cid}_{name}.png"
    else:
        save_name = f"card_{cid:03d}_{name}.png"
    save_path = os.path.join(BASE_DIR, save_name)
    
    print(f"[{i+1}/{len(STUBBORN)}] {name} (id={cid})...", end=" ", flush=True)
    
    cmd = [
        "python", SCRIPT, "sn-image-generate",
        "--prompt", prompt,
        "--aspect-ratio", "1:1",
        "--image-size", "2k",
        "--save-path", save_path,
        "--output-format", "json"
    ]
    
    try:
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=300)
        if result.returncode == 0:
            data = json.loads(result.stdout)
            if data.get("status") == "ok":
                print(f"✅ ({data.get('elapsed_seconds', '?')}s)")
                time.sleep(1)
                continue
        if os.path.exists(save_path) and os.path.getsize(save_path) > 1000:
            print(f"✅ (file)")
            continue
        print(f"❌")
    except subprocess.TimeoutExpired:
        if os.path.exists(save_path) and os.path.getsize(save_path) > 1000:
            print(f"✅ (timeout但文件保存)")
        else:
            print(f"❌ 超时")
    except Exception as e:
        print(f"❌ {e}")
    
    time.sleep(3)

print("\n=== Final retry complete ===")
