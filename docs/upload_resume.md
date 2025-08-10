To continue uploads across process restarts, implement a resumable upload strategy. This involves:

1.  **Chunking:** Breaking the file into smaller chunks.
2.  **Persistent Storage:** Storing the uploaded chunks in a persistent storage (e.g., cloud storage, database) with a unique identifier for the upload session.
3.  **Tracking Progress:** Maintaining metadata about the upload, such as the total file size, chunk size, number of chunks, and which chunks have been successfully uploaded.
4.  **Resumption Logic:**
    *   Upon restart, check for existing upload sessions in persistent storage.
    *   If a session exists, retrieve the upload metadata.
    *   Identify the missing chunks.
    *   Resume uploading from the point of interruption, sending only the missing chunks.
5.  **Finalization:** After all chunks are successfully uploaded, assemble the file and perform any necessary post-processing.

This approach ensures that even if the upload process is interrupted, the upload can be resumed without losing already uploaded data.