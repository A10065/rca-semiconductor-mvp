import json
import re

class RCANeuroSymbolicEngine:
    def __init__(self, ontology_path, history_path):
        self.ontology_path = ontology_path
        self.history_path = history_path
        self.causal_graph = self._parse_ontology()
        with open(history_path, 'r', encoding='utf-8') as f:
            self.history = json.load(f)

    def _parse_ontology(self):
        """簡單解析 Turtle 檔案中的因果邏輯 (Symbolic Logic)"""
        graph = {}
        content = open(self.ontology_path, 'r', encoding='utf-8').read()
        # 尋找 rca:Parameter rca:causes rca:Defect 的模式
        matches = re.findall(r'rca:(\w+)\s+rca:causes\s+rca:(\w+)', content)
        for param, defect in matches:
            if defect not in graph:
                graph[defect] = []
            graph[defect].append(param)
        return graph

    def diagnose(self, user_symptom):
        print(f"🔍 [輸入報告]：{user_symptom}")
        
        # 1. 模擬 Neural 語義搜尋 (在此簡化為關鍵字匹配，實際會用 Milvus)
        print("🤖 [Neural RAG] 正在搜尋歷史相似案例...")
        suggested_causes = []
        for rpt in self.history:
            if rpt['defect'] in user_symptom:
                suggested_causes.append(rpt)

        # 2. 模擬 Symbolic 驗證
        print("🧠 [Symbolic Logic] 正在與因果圖譜進行物理一致性校驗...")
        valid_results = []
        for cause in suggested_causes:
            defect_type = cause['defect']
            theoretical_causes = self.causal_graph.get(defect_type, [])
            
            # 核對歷史報告中的 root_cause 是否符合圖譜定義的參數
            is_valid = any(param in cause['root_cause'] for param in theoretical_causes)
            
            if is_valid:
                valid_results.append(cause)
                print(f" ✅ 驗證通過：{cause['root_cause']} 符合物理因果路徑。")
            else:
                print(f" ❌ 排除無效經驗：{cause['root_cause']} 與當前物理邏輯不符。")

        return valid_results

# Demo 執行
if __name__ == "__main__":
    engine = RCANeuroSymbolicEngine(
        "ontology/causal_ontology.ttl", 
        "data/historical_reports.json"
    )
    
    # 場景：作業員回報「發現有矽墊受損狀況」
    results = engine.diagnose("我們在 WB 段發現矽墊受損 (Cratered Die) 的問題。")
    
    print("\n--- 最終診斷報告 ---")
    if results:
        for r in results:
            print(f"主因建議：{r['root_cause']}")
            print(f"參考案例：{r['id']} - {r['description']}")
    else:
        print("未發現符合邏輯的已知因果路徑。")
