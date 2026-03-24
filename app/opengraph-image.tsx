import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'SmartHire — AI-Powered Recruitment';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function Image() {
    return new ImageResponse(
        (
            <div
                style={{
                    background: '#0f172a',
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '80px',
                }}
            >
                {/* Logo */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
                    <div style={{
                        background: '#6366f1',
                        borderRadius: '16px',
                        width: '64px',
                        height: '64px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}>
                        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v1a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-1H1a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2z"/>
                        </svg>
                    </div>
                    <span style={{ fontSize: '56px', fontWeight: 800, color: '#ffffff', letterSpacing: '-1px' }}>
                        Smart<span style={{ color: '#818cf8' }}>Hire</span>
                    </span>
                </div>

                {/* Tagline */}
                <p style={{ fontSize: '28px', color: '#94a3b8', margin: '0', textAlign: 'center', maxWidth: '800px', lineHeight: 1.4 }}>
                    AI-Powered Recruitment Platform
                </p>

                {/* Pills */}
                <div style={{ display: 'flex', gap: '16px', marginTop: '40px' }}>
                    {['Resume Scoring', 'Smart Matching', 'Instant Notifications'].map((label) => (
                        <div key={label} style={{
                            background: 'rgba(99, 102, 241, 0.15)',
                            border: '1px solid rgba(99, 102, 241, 0.3)',
                            borderRadius: '999px',
                            padding: '8px 20px',
                            color: '#a5b4fc',
                            fontSize: '18px',
                            fontWeight: 600,
                        }}>
                            {label}
                        </div>
                    ))}
                </div>

                {/* Domain */}
                <p style={{ position: 'absolute', bottom: '40px', fontSize: '18px', color: '#475569', margin: 0 }}>
                    smarthire.website
                </p>
            </div>
        ),
        { ...size }
    );
}
