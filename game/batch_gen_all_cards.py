#!/usr/bin/env python3
"""Batch generate ALL remaining card images using sn-image-generate with parallel workers."""
import subprocess, json, os, sys, time, threading
from datetime import datetime
from concurrent.futures import ThreadPoolExecutor, as_completed

BASE_DIR = r"G:\Hermes项目\card-game-design\assets\cards"
SCRIPT = r"C:\Users\安安\AppData\Local\hermes\skills\sn-image-base\scripts\sn_agent_runner.py"
WORKER_COUNT = 3  # parallel API calls
DELAY_BETWEEN = 2  # seconds between cards within a worker

os.makedirs(BASE_DIR, exist_ok=True)

# Card definitions: (id, name, faction, row, unique_prompt_keywords_brief)
# Already generated: 34, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 100
REMAINING = [
    # === SONG (宋) ===
    (1, "刘裕", "song", "infantry", "南朝宋武帝刘裕，英武统帅，身披重甲，手持长矛，骑战马，旌旗飘扬，帝王威严"),
    (2, "檀道济", "song", "infantry", "南朝宋名将檀道济，唱筹量沙，中年将军，面容坚毅，手持长矛，沙场点兵"),
    (3, "沈庆之", "song", "infantry", "南朝宋老将沈庆之，白发苍苍，拄长戟，身经百战，铠甲披风"),
    (4, "到彦之", "song", "infantry", "南朝宋大将领到彦之，军令如山，直立威严，右手举令牌，左手按剑"),
    (5, "谢晦", "song", "strategy", "南朝宋谋士谢晦，文人侧立，手持羽扇，儒冠长袍，腰带玉佩"),
    # === QI (齐) ===
    (6, "萧道成", "qi", "infantry", "齐高帝萧道成，帝王正面，冕旒冠，双手持天子剑，龙纹金腰带"),
    (7, "王俭", "qi", "strategy", "齐代谋士王俭，双手各持一封书信，离间计，神态狡黠"),
    (8, "褚渊", "qi", "strategy", "齐代书生褚渊，捧卷阅读，竹简展开，地上散落简册"),
    (9, "崔祖思", "qi", "infantry", "齐代武将崔祖思，前倾战斗姿态，双手握大刀，披风后飘"),
    (10, "王僧虔", "qi", "cavalry", "齐代书法名士王僧虔，宽袖挥毫，大毛笔，墨迹飞溅"),
    # === LIANG (梁) ===
    (11, "萧衍", "liang", "navy", "梁武帝萧衍，帝王形象，崇佛，手持佛珠，身披帝王袍"),
    (12, "韦睿", "liang", "infantry", "梁代名将韦睿，佛光普照，身披铠甲，手持念珠与长矛"),
    (13, "陈庆之", "liang", "cavalry", "白袍战神陈庆之，白衣白马，手持银枪，名垂千古，英武不凡"),
    (14, "羊侃", "liang", "navy", "梁代水将羊侃，站立船头，水攻指挥，手持令旗"),
    (15, "侯景", "liang", "infantry", "乱臣贼子侯景，面目阴沉，全身铠甲，手持弯刀"),
    # === CHEN (陈) ===
    (16, "陈霸先", "chen", "infantry", "陈武帝陈霸先，开国帝王，身披龙袍铠甲，手持宝剑"),
    (17, "吴明彻", "chen", "infantry", "南朝名将吴明彻，北伐姿态，须发花白，老当益壮手持长矛"),
    (18, "侯瑱", "chen", "navy", "陈代水将侯瑱，屯田粮草，手持镰刀与稻穗"),
    (19, "章昭达", "chen", "infantry", "陈代守将章昭达，坚壁清野，手持大盾，沉稳防御"),
    (20, "黄法氍", "chen", "navy", "陈代水军黄法氍，筹措粮草，手提钱袋粮袋，务实姿态"),
    # === BEIWEI (北魏) ===
    (21, "拓跋焘", "beiwei", "cavalry", "北魏太武帝拓跋焘，统一北方，骑战马，手持长矛，豪迈帝王"),
    (22, "崔浩", "beiwei", "strategy", "北魏军师崔浩，手持竹简地图，神机妙算，文士长袍"),
    (23, "尔朱荣", "beiwei", "cavalry", "北魏权臣尔朱荣，骁勇善战，全身铁甲，手持重锤"),
    (24, "贺拔岳", "beiwei", "cavalry", "北魏骑兵将领贺拔岳，铁骑纵横，骑战马，马刀高举"),
    (25, "奚康生", "beiwei", "cavalry", "北魏汉化将领奚康生，一手持弓箭，一手持书卷"),
    # === DONGWEI (东魏) ===
    (26, "高欢", "dongwei", "infantry", "东魏神武帝高欢，雄主威严，帝王甲胄，手持天子剑"),
    (27, "高澄", "dongwei", "strategy", "东魏富国强兵高澄，手持算盘与钱袋，富商气质"),
    (28, "慕容绍宗", "dongwei", "infantry", "东魏名将慕容绍宗，坚甲重铠，身披铁甲，手持长柄武器"),
    (29, "高岳", "dongwei", "infantry", "东魏围城之将高岳，指挥围城，手持令旗"),
    (30, "刘丰", "dongwei", "navy", "东魏水军将领刘丰，船头站立，手持船桨"),
    # === XIWEI (西魏) ===
    (31, "宇文泰", "xiwei", "infantry", "西魏大冢宰宇文泰，八柱国之首，威严统帅，手持虎符"),
    (32, "李虎", "xiwei", "cavalry", "西魏骑兵将领李虎，联防协同，骑战马，手持长枪"),
    (33, "侯莫陈崇", "xiwei", "cavalry", "西魏骁勇骑兵侯莫陈崇，骑战马，弯弓搭箭，英姿飒爽"),
    (35, "独孤信", "xiwei", "strategy", "八柱国独孤信，美男子，风流儒雅，腰佩长剑"),
    # === BEIQI (北齐) ===
    (36, "高洋", "beiqi", "cavalry", "北齐文宣帝高洋，疯癫天才，狂放不羁，骑战马手持酒壶"),
    (37, "斛律光", "beiqi", "cavalry", "北齐名将斛律光，暴击之姿，拉满大弓，目光如电"),
    (38, "兰陵王", "beiqi", "cavalry", "兰陵王，面具遮面，手持长戟，鬼神之姿"),
    (39, "段韶", "beiqi", "infantry", "北齐名将段韶，身披铠甲，手持令旗，指挥若定"),
    (40, "傅伏", "beiqi", "infantry", "北齐忠臣傅伏，守城姿态，手持长矛，神情坚定"),
    # === COMMON (公用) ===
    (101, "民兵", "common", "infantry", "保家卫国的民兵，手持简陋长矛，布衣裹身，朴实无华"),
    (102, "弓箭手", "common", "cavalry", "远程弓箭手，弯弓搭箭，瞄准姿态，箭在弦上"),
    (103, "辎重", "common", "navy", "补给辎重，推着粮草车，满载物资粮袋"),
    (104, "谋士", "common", "strategy", "运筹帷幄的谋士，手持羽扇，神态从容，智珠在握"),
    (105, "刺客", "common", "cavalry", "暗杀刺客，夜行黑衣，手持匕首，潜行姿态"),
    (106, "弩手", "common", "cavalry", "强弓劲弩手，端着重弩，瞄准射击"),
    (107, "盾兵", "common", "infantry", "盾阵士兵，持大盾，低姿防御，如铁壁"),
    (108, "轻骑", "common", "cavalry", "轻骑突进，骑快马，手持轻枪，动态十足"),
    (109, "传令", "common", "strategy", "传令兵，手持令旗书信，奔跑传令"),
    (110, "过牌", "common", "strategy", "运筹抽牌，手持竹筒竹签，抽签姿态"),
    (111, "连环计", "common", "strategy", "连环计谋，手持连环绳索，智谋布局"),
    (112, "暗度陈仓", "common", "strategy", "暗度陈仓计，夜间潜行，手持火把"),
    (113, "离间", "qi", "strategy", "挑拨离间之计，双手各指一方，挑拨姿态"),
    (114, "屯垦", "chen", "infantry", "屯田开垦，手持锄头，田间劳作"),
    (115, "奇袭", "xiwei", "cavalry", "奇袭敌后，持刀骑马突击，偷袭姿态"),
    (116, "密探", "beizhou", "strategy", "秘密探子，轻步潜行，手持密信"),
    (117, "毒箭", "common", "strategy", "淬毒箭矢，手持毒箭，箭尖阴森"),
    (118, "鸩酒", "qi", "strategy", "鸩酒毒杀，端着毒酒壶，神态阴冷"),
    (119, "铁壁", "liang", "infantry", "铁壁防御，手持大盾，全身铁甲如铁壁"),
    (120, "伏兵", "xiwei", "infantry", "设伏士兵，俯身埋伏草丛，等待出击"),
    (121, "吞并", "dongwei", "cavalry", "吞并弱牌，骑战马张口吞噬之势"),
    (122, "招魂", "beiwei", "strategy", "招魂复生，手持招魂幡，神秘巫术"),
    (123, "单挑", "song", "infantry", "决斗单挑，手持武器，摆出邀战姿态"),
    (124, "招降", "beizhou", "strategy", "招降纳叛，手持诏书，招揽姿态"),
    (125, "法阵", "chen", "navy", "八卦法阵，脚踏八卦阵图，手持法剑"),
    (126, "悬赏", "beiqi", "cavalry", "悬赏追杀，手持悬赏令，骑战马"),
    # === LEADERS (君主) ===
    ("L1", "宋武帝刘裕", "song", "leader", "宋武帝刘裕，南朝宋开国皇帝，英武帝王，冕冠龙袍，正面帝王像"),
    ("L2", "齐高帝萧道成", "qi", "leader", "齐高帝萧道成，南朝齐开国皇帝，儒雅帝王，冕冠龙袍，正面帝王像"),
    ("L3", "梁武帝萧衍", "liang", "leader", "梁武帝萧衍，南朝梁开国皇帝，崇佛帝王，冕冠手持佛珠，正面帝王像"),
    ("L4", "陈武帝陈霸先", "chen", "leader", "陈武帝陈霸先，南朝陈开国皇帝，雄武帝王，铠甲龙袍，正面帝王像"),
    ("L5", "北魏太武帝拓跋焘", "beiwei", "leader", "北魏太武帝拓跋焘，统一北方，豪迈帝王，胡服冠冕，正面帝王像"),
    ("L6", "东魏孝静帝元善见", "dongwei", "leader", "东魏孝静帝元善见，文弱帝王，冕冠垂帘，正面帝王像"),
    ("L7", "西魏文帝元宝炬", "xiwei", "leader", "西魏文帝元宝炬，睿智帝王，冕冠，正面帝王像"),
    ("L8", "北齐文宣帝高洋", "beiqi", "leader", "北齐文宣帝高洋，狂放帝王，冕冠不整，豪放不羁，正面帝王像"),
    ("L9", "北周武帝宇文邕", "beizhou", "leader", "北周武帝宇文邕，雄才大略帝王，冕冠，气宇轩昂，正面帝王像"),
]

ALREADY_DONE = {34, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 100}
done_count = 0
fail_count = 0
lock = threading.Lock()

def build_prompt(card_id, name, faction, row, keywords):
    faction_cn = {"song":"宋","qi":"齐","liang":"梁","chen":"陈","beiwei":"北魏",
                  "dongwei":"东魏","xiwei":"西魏","beiqi":"北齐","beizhou":"北周","common":"公用"}
    fc = faction_cn.get(faction, faction)
    row_cn = {"infantry":"步兵","cavalry":"骑兵","navy":"水军","strategy":"谋略","leader":"君主"}
    rc = row_cn.get(row, row)
    
    if row == "leader":
        return f"中国水墨风格卡牌插画，黑白水墨渲染，毛笔勾勒，{keywords}。墨色浓淡干湿变化，飞白笔法，写意帝王肖像，大量留白，纯透明底PNG，只有人物和书法文字，无背景色块边框，透明背景"
    else:
        return f"中国水墨风格卡牌插画，黑白水墨渲染，毛笔勾勒，{fc}·{rc}：{keywords}。墨色浓淡干湿变化，飞白笔法，写意人物，大量留白，纯透明底PNG，只有人物和书法文字，无背景色块边框，透明背景"

def generate_one(card_id, name, faction, row, keywords):
    global done_count, fail_count
    prompt = build_prompt(card_id, name, faction, row, keywords)
    
    if isinstance(card_id, str):
        save_name = f"leader_{card_id}_{name}.png"
    else:
        save_name = f"card_{card_id:03d}_{name}.png"
    save_path = os.path.join(BASE_DIR, save_name)
    
    cmd = [
        "python", SCRIPT, "sn-image-generate",
        "--prompt", prompt,
        "--aspect-ratio", "1:1",
        "--image-size", "2k",
        "--save-path", save_path,
        "--output-format", "json"
    ]
    
    try:
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=120)
        if result.returncode == 0:
            try:
                data = json.loads(result.stdout)
                if data.get("status") == "ok":
                    with lock:
                        done_count += 1
                        print(f"  ✅ [{done_count}/{len(REMAINING)}] {name} (id={card_id}) - {data.get('elapsed_seconds', '?')}s")
                    return True
            except json.JSONDecodeError:
                pass
        print(f"  ❌ {name} (id={card_id}) - FAILED")
        with lock:
            fail_count += 1
        return False
    except subprocess.TimeoutExpired:
        # Check if file was saved despite timeout
        if os.path.exists(save_path) and os.path.getsize(save_path) > 1000:
            with lock:
                done_count += 1
                print(f"  ✅ [{done_count}/{len(REMAINING)}] {name} (id={card_id}) - saved despite timeout")
            return True
        print(f"  ❌ {name} (id={card_id}) - TIMEOUT, no file saved")
        with lock:
            fail_count += 1
        return False
    except Exception as e:
        print(f"  ❌ {name} (id={card_id}) - ERROR: {e}")
        with lock:
            fail_count += 1
        return False

def worker(cards_batch, worker_id):
    print(f"\n--- Worker {worker_id} starting ({len(cards_batch)} cards) ---")
    for i, (cid, name, fac, row, kw) in enumerate(cards_batch):
        generate_one(cid, name, fac, row, kw)
        if i < len(cards_batch) - 1:
            time.sleep(DELAY_BETWEEN)  # avoid rate limiting within worker
    print(f"--- Worker {worker_id} finished ---")

if __name__ == "__main__":
    print(f"=== Batch Ink-Wash Card Image Generator ===")
    print(f"Total remaining: {len(REMAINING)} cards")
    print(f"Workers: {WORKER_COUNT}")
    print(f"Output: {BASE_DIR}")
    print(f"Starting at: {datetime.now().strftime('%H:%M:%S')}\n")
    
    # Split cards among workers
    batch_size = (len(REMAINING) + WORKER_COUNT - 1) // WORKER_COUNT
    batches = []
    for w in range(WORKER_COUNT):
        start = w * batch_size
        end = min(start + batch_size, len(REMAINING))
        if start < end:
            batches.append(REMAINING[start:end])
    
    threads = []
    for w, batch in enumerate(batches):
        t = threading.Thread(target=worker, args=(batch, w+1), daemon=True)
        threads.append(t)
        t.start()
    
    for t in threads:
        t.join()
    
    elapsed = time.time() - __import__('time').time()  # placeholder, let me fix
    print(f"\n=== COMPLETE at {datetime.now().strftime('%H:%M:%S')} ===")
    print(f"Success: {done_count}/{len(REMAINING)}")
    print(f"Failed: {fail_count}")
    
    # List generated files
    files = sorted(os.listdir(BASE_DIR))
    pngs = [f for f in files if f.endswith('.png')]
    print(f"\nTotal PNG files in {BASE_DIR}: {len(pngs)}")
