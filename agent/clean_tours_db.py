import json
import re
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import pymysql
from agent.google_maps_enricher import LIVE_DB


def clean_val(v):
    if not v:
        return []
    try:
        items = json.loads(v) if isinstance(v, str) else v
    except Exception:
        items = []
    cleaned = []
    for it in items:
        if isinstance(it, dict):
            txt = it.get('otherDescription') or it.get('description') or it.get('categoryDescription') or str(it)
            cleaned.append(txt)
        elif isinstance(it, str):
            m = re.search(r"'otherDescription':\s*'([^']+)'", it)
            if m:
                cleaned.append(m.group(1))
            else:
                m2 = re.search(r"'description':\s*'([^']+)'", it)
                if m2:
                    cleaned.append(m2.group(1))
                else:
                    cleaned.append(it)
        else:
            cleaned.append(str(it))
    return cleaned


def clean_database():
    conn = pymysql.connect(**LIVE_DB)
    try:
        with conn.cursor() as cur:
            cur.execute('SELECT id, inclusions, exclusions FROM tour_packages')
            rows = cur.fetchall()
            for r in rows:
                pid, inc, exc = r
                new_inc = json.dumps(clean_val(inc))
                new_exc = json.dumps(clean_val(exc))
                cur.execute('UPDATE tour_packages SET inclusions = %s, exclusions = %s WHERE id = %s', (new_inc, new_exc, pid))
        conn.commit()
        print(f"Cleaned {len(rows)} packages in MariaDB successfully!")
    finally:
        conn.close()


if __name__ == '__main__':
    clean_database()
