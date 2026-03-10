const fs = require('fs');
const path = require('path');

class RCANeuroSymbolicEngine {
    constructor(ontologyPath, historyPath) {
        this.ontologyPath = ontologyPath;
        this.historyPath = historyPath;
        this.causalGraph = this._parseOntology();
        this.history = JSON.parse(fs.readFileSync(historyPath, 'utf8'));
    }

    _parseOntology() {
        /** 簡單解析 Turtle 格式中的因果關係並建立術語映射 */
        this.termMap = {
            "CrateredDie": "矽墊受損",
            "WirePeeling": "金線剝離",
            "UltrasonicPower": "Ultrasonic Power",
            "BondForce": "Bond Force"
        };
        const graph = {};
        const content = fs.readFileSync(this.ontologyPath, 'utf8');
        const regex = /rca:(\w+)\s+rca:causes\s+rca:(\w+)/g;
        let match;
        while ((match = regex.exec(content)) !== null) {
            const [_, param, defect] = match;
            const defectZh = this.termMap[defect] || defect;
            if (!graph[defectZh]) graph[defectZh] = [];
            graph[defectZh].push(this.termMap[param] || param);
        }
        return graph;
    }

    diagnose(userSymptom) {
        console.log(`\n🔍 [輸入報告]：${userSymptom}`);

        // 1. 模擬 Neural 檢索
        console.log("🤖 [Neural RAG] 正在搜尋歷史相似案例...");
        const suggestedCauses = this.history.filter(rpt => userSymptom.includes(rpt.defect));

        // 2. 模擬 Symbolic 驗證
        console.log("🧠 [Symbolic Logic] 正在與因果圖譜進行物理一致性校驗...");
        const validResults = suggestedCauses.filter(cause => {
            const defectEn = cause.defect;
            const theoreticalParameters = this.causalGraph[defectEn] || [];

            // 檢查歷史報告的主因，是否符合圖譜定義的參數名稱 (忽略大小寫與空格)
            const isValid = theoreticalParameters.some(param => {
                const p = param.toLowerCase().replace(/\s/g, '');
                const c = cause.root_cause.toLowerCase().replace(/\s/g, '');
                return c.includes(p);
            });

            if (isValid) {
                console.log(` ✅ 驗證通過：【${cause.root_cause}】 符合物理因果路徑。`);
            } else {
                console.log(` ❌ 排除無效經驗：【${cause.root_cause}】 與當前物理邏輯不符。`);
            }
            return isValid;
        });

        return validResults;
    }
}

// Demo 執行
const engine = new RCANeuroSymbolicEngine(
    path.join(__dirname, '../ontology/causal_ontology.ttl'),
    path.join(__dirname, '../data/historical_reports.json')
);

const results = engine.diagnose("我們在 WB 段發現矽墊受損 (Cratered Die) 的問題。");

console.log("\n--- 最終診斷報告 ---");
if (results.length > 0) {
    results.forEach(r => {
        console.log(`主因建議：${r.root_cause}`);
        console.log(`參考案例：${r.id} - ${r.description}`);
    });
} else {
    console.log("未發現符合邏輯的已知因果路徑。");
}
