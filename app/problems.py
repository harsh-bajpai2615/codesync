"""A small embedded set of practice problems (Python, function-based) with test
cases, so students can solve *inside* the app. Each solution is run against its
cases via a generated test harness.
"""
from __future__ import annotations

import json

from .runner import run_python

PROBLEMS = {
    "contains-duplicate": {
        "title": "Contains Duplicate", "difficulty": "Easy", "topic": "Array / Hashing",
        "statement": "Return True if any value appears at least twice in `nums`, else False.",
        "func": "containsDuplicate",
        "starter": "def containsDuplicate(nums):\n    # your code here\n    pass\n",
        "cases": [[[[1, 2, 3, 1]], True], [[[1, 2, 3, 4]], False],
                  [[[1, 1, 1, 3, 3, 4, 3, 2, 4, 2]], True]],
    },
    "valid-anagram": {
        "title": "Valid Anagram", "difficulty": "Easy", "topic": "Strings / Hashing",
        "statement": "Return True if `t` is an anagram of `s`.",
        "func": "isAnagram",
        "starter": "def isAnagram(s, t):\n    # your code here\n    pass\n",
        "cases": [[["anagram", "nagaram"], True], [["rat", "car"], False], [["a", "a"], True]],
    },
    "best-time-to-buy-and-sell-stock": {
        "title": "Best Time to Buy and Sell Stock", "difficulty": "Easy", "topic": "Sliding Window",
        "statement": "Given daily `prices`, return the max profit from one buy + one later sell (0 if none).",
        "func": "maxProfit",
        "starter": "def maxProfit(prices):\n    # your code here\n    pass\n",
        "cases": [[[[7, 1, 5, 3, 6, 4]], 5], [[[7, 6, 4, 3, 1]], 0], [[[1, 2]], 1]],
    },
    "maximum-subarray": {
        "title": "Maximum Subarray", "difficulty": "Medium", "topic": "DP / Greedy",
        "statement": "Return the largest sum of any contiguous subarray of `nums` (Kadane's).",
        "func": "maxSubArray",
        "starter": "def maxSubArray(nums):\n    # your code here\n    pass\n",
        "cases": [[[[-2, 1, -3, 4, -1, 2, 1, -5, 4]], 6], [[[1]], 1], [[[5, 4, -1, 7, 8]], 23]],
    },
    "climbing-stairs": {
        "title": "Climbing Stairs", "difficulty": "Easy", "topic": "1-D DP",
        "statement": "You climb 1 or 2 steps at a time. Return the number of distinct ways to reach step `n`.",
        "func": "climbStairs",
        "starter": "def climbStairs(n):\n    # your code here\n    pass\n",
        "cases": [[[2], 2], [[3], 3], [[5], 8]],
    },
    "binary-search": {
        "title": "Binary Search", "difficulty": "Easy", "topic": "Binary Search",
        "statement": "Return the index of `target` in sorted `nums`, or -1 if absent. O(log n).",
        "func": "search",
        "starter": "def search(nums, target):\n    # your code here\n    pass\n",
        "cases": [[[[-1, 0, 3, 5, 9, 12], 9], 4], [[[-1, 0, 3, 5, 9, 12], 2], -1], [[[5], 5], 0]],
    },
}


def listing():
    return [{"id": pid, "title": p["title"], "difficulty": p["difficulty"], "topic": p["topic"]}
            for pid, p in PROBLEMS.items()]


def get(pid):
    p = PROBLEMS.get(pid)
    if not p:
        return None
    return {"id": pid, "title": p["title"], "difficulty": p["difficulty"], "topic": p["topic"],
            "statement": p["statement"], "starter": p["starter"]}


def _harness(code, prob):
    cases = repr(prob["cases"])  # Python literal (keeps True/False, unlike JSON)
    fn = prob["func"]
    return (code + "\n\n"
            + f"_C = {cases}\n_p = 0\n"
            + "for _i, (_a, _e) in enumerate(_C):\n"
            + "    try:\n"
            + f"        _g = {fn}(*_a)\n"
            + "        _ok = (_g == _e)\n"
            + "        print(('PASS' if _ok else 'FAIL') + f' #{_i+1}  input={_a}  ->  {_g}'"
            + " + ('' if _ok else f'   (expected {_e})'))\n"
            + "        _p += 1 if _ok else 0\n"
            + "    except Exception as _ex:\n"
            + "        print(f'ERROR #{_i+1}: {_ex!r}')\n"
            + "print(f'__RESULT__ {_p} {len(_C)}')\n")


def run_tests(code, pid):
    prob = PROBLEMS.get(pid)
    if not prob:
        return {"ok": False, "output": "Unknown problem.", "passed": 0, "total": 0}
    res = run_python(_harness(code, prob))
    out = res["stdout"]
    passed = total = 0
    lines = []
    for ln in out.splitlines():
        if ln.startswith("__RESULT__"):
            _, p, t = ln.split()
            passed, total = int(p), int(t)
        else:
            lines.append(ln)
    if res["stderr"]:
        lines.append(res["stderr"])
    return {"ok": total > 0 and passed == total, "passed": passed, "total": total,
            "output": "\n".join(lines).strip(), "ms": res["ms"]}
