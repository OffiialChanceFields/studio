// public/workers/harParser.worker.js
let concatenatedChunks = new Uint8Array(0);

self.onmessage = function(event) {
    if (event.data.chunk) {
        const newChunk = event.data.chunk;
        const newConcatenatedChunks = new Uint8Array(concatenatedChunks.length + newChunk.length);
        newConcatenatedChunks.set(concatenatedChunks);
        newConcatenatedChunks.set(newChunk, concatenatedChunks.length);
        concatenatedChunks = newConcatenatedChunks;
    }

    if (event.data.done) {
        try {
            const decoder = new TextDecoder('utf-8');
            const harText = decoder.decode(concatenatedChunks);
            const harData = JSON.parse(harText);

            if (harData.log && harData.log.entries) {
                self.postMessage({ type: 'entries', entries: harData.log.entries });
            } else {
                self.postMessage({ type: 'error', message: 'Invalid HAR structure: Missing log.entries' });
            }
        } catch (e) {
            self.postMessage({ type: 'error', message: e.message });
        }
        // Reset for next file
        concatenatedChunks = new Uint8Array(0);
    }
};
