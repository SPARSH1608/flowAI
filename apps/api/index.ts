import { executeWorkflow } from "./src/services/executorService.js";

const workflow = {
    "nodes": [
        {
            "id": "text1",
            "type": "TEXT_NODE",
            "data": {
                "config": {
                    "text": "A cinematic podcast portrait, dramatic lighting"
                }
            }
        },
        {
            "id": "img1",
            "type": "IMAGE_GENERATION_NODE",
            "data": {
                "config": {}
            }
        }
    ],
    "edges": [
        {
            "source": "text1",
            "sourceHandle": "out:text",
            "target": "img1",
            "targetHandle": "in:text"
        }
    ]
}


const result = await executeWorkflow(workflow);
console.log(JSON.stringify(result, null, 2));
