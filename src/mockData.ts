import { Analysis } from './types';

export const mockAnalyses: Analysis[] = [
  {
    id: '1',
    status: 'suspicious',
    confidence: 0.92,
    reasons: [
      'Multiple requests for OTP',
      'Mentioned installing AnyDesk',
      'Urgency in tone detected'
    ],
    timestamp: new Date().toISOString(),
    audioFileName: 'suspicious_call_1.mp3',
    transcription: 'Hello, I am calling from your bank. We have detected suspicious activity. Please install AnyDesk and share your OTP...'
  },
  {
    id: '2',
    status: 'not_suspicious',
    confidence: 0.85,
    reasons: ['Normal conversation pattern', 'No sensitive information requested'],
    timestamp: new Date().toISOString(),
    audioFileName: 'normal_call_1.mp3',
    transcription: 'Hi, this is John from customer service following up on your recent purchase...'
  }
];