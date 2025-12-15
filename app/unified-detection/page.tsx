import UnifiedDetectionPanel from '@/components/detection/UnifiedDetectionPanel';

export default function UnifiedDetectionPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
            <div className="container mx-auto px-4 py-8">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
                        Unified Defect Detection
                    </h1>
                    <p className="text-gray-600">
                        Switch between client-side TFJS, backend API, or mock mode with real-time console logging
                    </p>
                </div>

                <UnifiedDetectionPanel />
            </div>
        </div>
    );
}
