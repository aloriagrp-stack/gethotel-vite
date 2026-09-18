/**
 * In-House Python AI & Onboarding Engine Client
 * Connects the Node.js backend to the local Python microservice (http://127.0.0.1:8000)
 * Zero external third-party API dependencies.
 */

const PYTHON_ENGINE_BASE_URL = process.env.PYTHON_ENGINE_URL || 'http://127.0.0.1:8000';

class PythonEngineClient {
    constructor(baseUrl = PYTHON_ENGINE_BASE_URL) {
        this.baseUrl = baseUrl.replace(/\/$/, '');
    }

    /**
     * Check if the Python engine is running and healthy
     */
    async isHealthy() {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 2500);
            const res = await fetch(`${this.baseUrl}/health`, {
                signal: controller.signal
            });
            clearTimeout(timeoutId);
            if (res.ok) {
                const data = await res.json();
                return data.status === 'ok';
            }
            return false;
        } catch (err) {
            return false;
        }
    }

    /**
     * Suggest and synthesize rooms from URLs or user prompts
     */
    async suggestRooms(payload) {
        return this._post('/api/suggest-rooms', payload);
    }

    /**
     * Scrape or parse customer reviews
     */
    async importReviews(payload) {
        return this._post('/api/import-reviews', payload);
    }

    /**
     * Parse uploaded bulk hotel files (JSON / Text)
     */
    async bulkOnboardPreview(payload) {
        return this._post('/api/bulk-onboard-preview', payload);
    }

    /**
     * Convert and optimize image to WebP format
     */
    async convertWebP(payload) {
        return this._post('/api/convert-webp', payload);
    }

    /**
     * Internal POST helper with standard error formatting
     */
    async _post(endpoint, data, timeoutMs = 60000) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

        try {
            const res = await fetch(`${this.baseUrl}${endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data),
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (!res.ok) {
                const errText = await res.text();
                throw new Error(`Python Engine returned HTTP ${res.status}: ${errText}`);
            }

            return await res.json();
        } catch (err) {
            clearTimeout(timeoutId);
            if (err.name === 'AbortError') {
                throw new Error(`Python Engine request timed out after ${timeoutMs / 1000}s`);
            }
            throw err;
        }
    }
}

module.exports = new PythonEngineClient();
