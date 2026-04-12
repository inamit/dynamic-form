
async function mockCheckAuth(item: any) {
    // Simulate a network delay for the auth check
    await new Promise(resolve => setTimeout(resolve, 50));
    return { allowed: true };
}

async function runSequential(dataList: any[]) {
    const start = Date.now();
    const filteredList = [];
    for (const item of dataList) {
        const auth = await mockCheckAuth(item);
        if (auth.allowed) {
            filteredList.push(item);
        }
    }
    const end = Date.now();
    return end - start;
}

async function runConcurrent(dataList: any[]) {
    const start = Date.now();
    const results = await Promise.all(dataList.map(item => mockCheckAuth(item)));
    const filteredList = dataList.filter((_, index) => results[index].allowed);
    const end = Date.now();
    return end - start;
}

async function main() {
    const dataList = Array.from({ length: 20 }, (_, i) => ({ id: i }));

    console.log(`Running benchmark with ${dataList.length} items and 50ms mock delay per auth check...`);

    const seqTime = await runSequential(dataList);
    console.log(`Sequential time: ${seqTime}ms`);

    const conTime = await runConcurrent(dataList);
    console.log(`Concurrent time: ${conTime}ms`);

    const improvement = ((seqTime - conTime) / seqTime * 100).toFixed(2);
    console.log(`Improvement: ${improvement}%`);
}

main().catch(console.error);
