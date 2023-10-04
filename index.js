let observedEntries = [];
let ttiPolyfill = null;

const observer = new PerformanceObserver(entryList => {
    const entries = entryList.getEntries();
    observedEntries = observedEntries.concat(entries);
    
    if (!ttiPolyfill) {
        // Detect the TTI based on a 5-second quiet window
        const quietWindowEnd = findQuietWindow(5000);
        if (quietWindowEnd !== null) {
            ttiPolyfill = quietWindowEnd;
            console.log("TTI (polyfill) detected at", ttiPolyfill, "ms");
            observer.disconnect(); // Stop observing once TTI is found
        }
    }
});

observer.observe({ entryTypes: ['longtask'] });

function findQuietWindow(windowSize) {
    let lastLongTaskEnd = 0;

    for (const task of observedEntries) {
        if (task.startTime - lastLongTaskEnd > windowSize) {
            return lastLongTaskEnd;
        }
        if (task.duration > 50) {
            lastLongTaskEnd = task.startTime + task.duration;
        }
    }
    if (performance.now() - lastLongTaskEnd > windowSize) {
        return lastLongTaskEnd;
    }
    return null;
}