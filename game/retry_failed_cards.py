#!/usr/bin/env python3
"""Retry failed cards one by one with longer timeout."""
import subprocess, json, os, time

BASE_DIR = r"G:\Hermes项目\card-game-design\assets\cards"
SCRIPT = r"C:\Users\安安\AppData\Local\hermes\skills\sn-image-base\scripts\sn_agent_runner.py"

# Cards that need retry (id, name, faction, row, keywords)
FAILED = [
    (1, "刘裕", "song", "infantry", "南朝宋武帝刘裕，英武统帅，身披重甲，手持长矛，骑战马，帝王威严"),
    (2, "檀道济", "song", "infantry", "南朝宋名将檀道济，唱筹量沙，中年将军，面容坚毅，手持长矛，沙场点兵"),
    (9, "崔祖思", "qi", "infantry", "齐代武将崔祖思，前倾战斗姿态，双手握大刀，披风后飘"),
    (12, "韦睿", "liang", "infantry", "梁代名将韦睿，佛光普照，身披铠甲，手持念珠与长矛"),
    (13, "陈庆之", "liang", "cavalry", "白袍战神陈庆之，白衣白马，手持银枪，名垂千古，英武不凡"),
    (17, "吴明彻", "chen", "infantry", "南朝名将吴明彻，北伐姿态，须发花白，老当益壮手持长矛"),
    (22, "崔浩", "beiwei", "strategy", "北魏军师崔浩，手持竹简地图，神机妙算，文士长袍"),
    (25, "奚康生", "beiwei", "cavalry", "北魏汉化将领奚康生，一手持弓箭，一手持书卷"),
    (30, "刘丰", "dongwei", "navy", "东魏水军将领刘丰，船头站立，手持船桨"),
    (31, "宇文泰", "xiwei", "infantry", "西魏大冢宰宇文泰，八柱国之首，威严统帅，手持虎符"),
    (36, "高洋", "beiqi", "cavalry", "北齐文宣帝高洋，疯癫天才，狂放不羁，骑战马手持酒壶"),
    (39, "段韶", "beiqi", "infantry", "北齐名将段韶，身披铠甲，手持令旗，指挥若定"),
    (101, "民兵", "common", "infantry", "保家卫国的民兵，手持简陋长矛，布衣裹身，朴实无华"),
    (104, "谋士", "common", "strategy", "运筹帷幄的谋士，手持羽扇，神态从容，智珠在握"),
    (107, "盾兵", "common", "infantry", "盾阵士兵，持大盾，低姿防御，如铁壁"),
    (113, "离间", "qi", "strategy", "挑拨离间之计，双手各指一方，挑拨姿态"),
    (114, "屯垦", "chen", "infantry", "屯田开垦，手持锄头，田间劳作"),
    (115, "奇袭", "xiwei", "cavalry", "奇袭敌后，持刀骑马突击，偷袭姿态"),
    (125, "法阵", "chen", "navy", "八卦法阵，脚踏八卦阵图，手持法剑"),
    ("L1", "宋武帝刘裕", "song", "leader", "宋武帝刘裕，南朝宋开国皇帝，英武帝王，冕冠龙袍，正面帝王像"),
    ("L3", "梁武帝萧衍", "liang", "leader", "梁武帝萧衍，南朝梁开国皇帝，崇佛帝王，冕冠手持佛珠，正面帝王像"),
    ("L4", "陈武帝陈霸先", "chen", "leader", "陈武帝陈霸先，南朝陈开国皇帝，雄武帝王，铠甲龙袍，正面帝王像"),
    ("L8", "北齐文宣帝高洋", "beiqi", "leader", "北齐文宣帝高洋，狂放帝王，冕冠不整，豪放不羁，正面帝王像"),
]

success = 0
failed = 0

for i, (cid, name, faction, row, keywords) in enumerate(FAILED):
    faction_cn = {"song":"宋","qi":"齐","liang":"梁","chen":"陈","beiwei":"北魏",
                  "dongwei":"东魏","xiwei":"西魏","beiqi":"北齐","beizhou":"北周","common":"公用"}
    row_cn = {"infantry":"步兵","cavalry":"骑兵","navy":"水军","strategy":"谋略","leader":"君主"}
    
    if row == "leader":
        prompt = f"中国水墨风格卡牌插画，黑白水墨渲染，毛笔勾勒，{keywords}。墨色浓淡干湿变化，飞白笔法，写意帝王肖像，大量留白，纯透明底PNG，只有人物和书法文字，无背景色块边框，透明背景"
    else:
        prompt = f"中国水墨风格卡牌插画，黑白水墨渲染，毛笔勾勒，{faction_cn.get(faction,faction)}·{row_cn.get(row,row)}：{keywords}。墨色浓淡干湿变化，飞白笔法，写意人物，大量留白，纯透明底PNG，只有人物和书法文字，无背景色块边框，透明背景"
    
    if isinstance(cid, str):
        save_name = f"leader_{cid}_{name}.png"
    else:
        save_name = f"card_{cid:03d}_{name}.png"
    save_path = os.path.join(BASE_DIR, save_name)
    
    print(f"[{i+1}/{len(FAILED)}] {name} (id={cid})...", end=" ", flush=True)
    
    cmd = [
        "python", SCRIPT, "sn-image-generate",
        "--prompt", prompt,
        "--aspect-ratio", "1:1",
        "--image-size", "2k",
        "--save-path", save_path,
        "--output-format", "json"
    ]
    
    try:
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=180)
        if result.returncode == 0:
            try:
                data = json.loads(result.stdout)
                if data.get("status") == "ok":
                    print(f"✅ ({data.get('elapsed_seconds', '?')}s)")
                    success += 1
                    time.sleep(1)
                    continue
            except:
                pass
        # Check file anyway
        if os.path.exists(save_path) and os.path.getsize(save_path) > 1000:
            print(f"✅ (file exist)")
            success += 1
        else:
            print(f"❌ FAILED")
            failed += 1
    except subprocess.TimeoutExpired:
        if os.path.exists(save_path) and os.path.getsize(save_path) > 1000:
            print(f"✅ (timout but file saved)")
            success += 1
        else:
            print(f"❌ TIMEOUT")
            failed += 1
    except Exception as e:
        print(f"❌ ERROR: {e}")
        failed += 1
    
    time.sleep(2)

print(f"\n=== Retry Complete: {success} success, {failed} failed ===")
