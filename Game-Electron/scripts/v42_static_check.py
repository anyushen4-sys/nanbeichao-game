"""
V42 Static Check — 南朝卡牌游戏 ability/combo static integrity verification.

Verifies every switch statement in src/index.html that dispatches on
ability type / combo signal / leader type:
  1. Switch has a default branch (warns silent failures)
  2. Switch cases cover all types declared in source data
     (cards.json ability, leaders.json ability.type, combos.js signals)
  3. No data-declared type falls through to default (silent no-op)

Exit codes:
  0 = all checks pass
  1 = one or more issues found
"""
import json
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
INDEX_HTML = os.path.join(ROOT, 'src', 'index.html')
CARDS_JSON = os.path.join(ROOT, 'src', 'data', 'cards.json')
LEADERS_JSON = os.path.join(ROOT, 'src', 'data', 'leaders.json')
COMBOS_JS = os.path.join(ROOT, 'src', 'js', 'combos.js')

# Reusable brace counter: returns the substring from the opening brace to its match
def extract_block(src, open_idx):
    depth = 1
    i = open_idx + 1
    while i < len(src) and depth > 0:
        if src[i] == '{':
            depth += 1
        elif src[i] == '}':
            depth -= 1
            if depth == 0:
                return src[open_idx + 1:i]
        i += 1
    return None

def extract_switch_blocks(src):
    """Return list of (line_no, body) for every `switch(...) { ... }` block."""
    out = []
    for m in re.finditer(r'\bswitch\s*\(', src):
        # Find matching '{' for the switch body
        brace_idx = src.index('{', m.end())
        body = extract_block(src, brace_idx)
        if body is None:
            continue
        line_no = src.count('\n', 0, m.start()) + 1
        out.append((line_no, body))
    return out

def extract_cases(body):
    """Return set of case labels found in a switch body (e.g. case'foo':)."""
    # Source uses `case'foo':` (no space) — match both styles
    return set(m.group(1) for m in re.finditer(r"case\s*'([^']+)':", body))

def has_default(body):
    return bool(re.search(r"\bdefault\s*:", body))

def parse_data_types_cards(path):
    """Return set of ability types declared in cards.json.ability values."""
    if not os.path.exists(path):
        return set()
    data = json.load(open(path, encoding='utf-8'))
    types = set()
    for c in data.get('cards', []):
        ab = c.get('ability')
        if not ab or not isinstance(ab, str):
            continue
        # ability format: "type:value" or "{type:'foo',row:'bar',value:2}"
        m = re.match(r"([a-z_]+)", ab)
        if m:
            types.add(m.group(1))
    return types

def parse_data_types_leaders(path):
    """Return set of ability.type values declared in leaders.json."""
    if not os.path.exists(path):
        return set()
    data = json.load(open(path, encoding='utf-8'))
    types = set()
    for l in data.get('leaders', []):
        ab = l.get('ability')
        if not ab or not isinstance(ab, str):
            continue
        m = re.search(r"type:'([^']+)'", ab)
        if m:
            types.add(m.group(1))
    return types

def parse_combo_signals(path):
    """Return set of combo signal strings declared in combos.js.

    Sources:
      - signals: ['foo', 'bar'] array literals
      - signals.push('foo') call arguments
    """
    if not os.path.exists(path):
        return set()
    src = open(path, encoding='utf-8').read()
    signals = set()

    # Pattern A: signals: ['foo', 'bar']
    for m in re.finditer(r"signals\s*:\s*\[([^\]]*)\]", src):
        for s in re.findall(r"'([^']+)'", m.group(1)):
            signals.add(s)

    # Pattern B: signals.push('foo')
    for m in re.finditer(r"signals\.push\(\s*['\"]([^'\"]+)['\"]", src):
        signals.add(m.group(1))

    return signals

def is_phase_switch(body):
    """Detect phase state machine switches like switch(G.phase)."""
    # Phase names contain underscore or known phase words
    phase_words = {'menu', 'playing', 'round_result', 'game_result', 'leader_select',
                   'mulligan', 'settings', 'tutorial', 'hot_seat_playing',
                   'multiplayer_lobby', 'multiplayer_playing'}
    cases = extract_cases(body)
    return bool(cases) and cases.issubset(phase_words)

def is_ability_switch(body):
    """Heuristic: this switch dispatches on an ability/signal/leader-type label."""
    cases = extract_cases(body)
    if not cases:
        return False
    if is_phase_switch(body):
        return False
    short_like = sum(1 for c in cases if '_' in c or len(c) <= 12)
    return short_like / len(cases) > 0.5

def main():
    if not os.path.exists(INDEX_HTML):
        print(f'FATAL: {INDEX_HTML} not found'); return 2

    html = open(INDEX_HTML, encoding='utf-8').read()
    cards_types = parse_data_types_cards(CARDS_JSON)
    leaders_types = parse_data_types_leaders(LEADERS_JSON)
    combos_signals = parse_combo_signals(COMBOS_JS)

    print('=' * 70)
    print('V42 Static Check — ability / combo dispatch integrity')
    print('=' * 70)
    print(f'cards.json  ability types: {sorted(cards_types)}')
    print(f'leaders.json ability.type: {sorted(leaders_types)}')
    print(f'combos.js signals (guess): {sorted(combos_signals)}')
    print()

    switches = extract_switch_blocks(html)
    # Filter out phase switches (state machine, not ability dispatch)
    ability_switches = [(ln, body) for ln, body in switches if is_ability_switch(body)]

    print(f'Found {len(ability_switches)} ability/signal switch(es):')
    issues = []

    for ln, body in ability_switches:
        cases = extract_cases(body)
        default_present = has_default(body)
        print(f'\n  L{ln}: {len(cases)} case(s), default={default_present}')
        print(f'    cases: {sorted(cases)}')

        # Determine which data source this switch is likely for
        # Heuristic: overlap with leaders.json types > 50% -> leader switch
        # Else if 2+ combo signals matched -> combo switch
        # Else -> card ability switch
        ov_leaders = cases & leaders_types
        ov_cards = cases & cards_types
        ov_combos = cases & combos_signals

        if ov_leaders and len(ov_leaders) / max(1, len(leaders_types)) > 0.5:
            src_label = 'leader.ability'
            data_types = leaders_types
        elif ov_combos and len(ov_combos) >= 2:
            src_label = 'combo signals (matched)'
            data_types = combos_signals
        else:
            src_label = 'card.ability'
            data_types = cards_types

        print(f'    serves: {src_label} (data declares: {sorted(data_types)})')

        # Check 1: default branch present?
        if not default_present:
            msg = f'    WARN: no default branch — unknown types silently no-op'
            print(msg)
            issues.append(('no-default', ln, src_label))

        # Check 2: data types not covered by cases (silent failure)
        # Only check exact-name matches. Fragment labels like 'combo_row_stacking:'
        # from concatenation in combos.js are not real signals.
        uncovered = data_types - cases
        if uncovered:
            # Filter out fragments (signals ending with ':' that come from string concat)
            real_uncovered = {t for t in uncovered if not t.endswith(':')}
            if real_uncovered:
                msg = f'    FAIL: data declares types not in switch: {sorted(real_uncovered)}'
                print(msg)
                issues.append(('uncovered-data-type', ln, sorted(real_uncovered)))

        # Check 3: cases in switch not in data (dead code)
        orphans = cases - data_types
        if orphans:
            print(f'    INFO: cases not in current data (dead code?): {sorted(orphans)}')

    print()
    print('=' * 70)
    if not issues:
        print('PASS — no critical issues')
        return 0

    # Group by issue type
    from collections import Counter
    counts = Counter(i[0] for i in issues)
    print(f'ISSUES: {len(issues)} total ({dict(counts)})')
    for kind, ln, detail in issues:
        print(f'  L{ln} [{kind}]: {detail}')
    return 1

if __name__ == '__main__':
    sys.exit(main())
