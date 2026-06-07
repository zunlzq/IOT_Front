# IOT_Front

스마트 헬멧 센서 모니터링 및 작업자 통합 관제 대시보드 프론트엔드 (Next.js)

## 기술 스택
- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS
- **Map**: Leaflet (react-leaflet)

## 시작하기

### 1. 의존성 설치
```bash
npm install
```

### 2. 개발 서버 실행
```bash
npm run dev
```
서버 실행 후 [http://localhost:3000](http://localhost:3000)에서 대시보드에 접속합니다.
* 실시간 센서 값 수신 및 시뮬레이션을 위해서는 백엔드 Flask 서버(8000 포트)가 실행 중이어야 합니다.

## 주요 기능
- **실시간 모니터링**: 작업자 센서 정보 및 위험/주의 상태 실시간 관제
- **실시간 지도**: 작업자 GPS 수신 좌표를 지도 마커로 표시
- **작업자 관리**: 작업자 추가, 수정, 삭제 기능 (localStorage 연동)
- **센서 시뮬레이터**: 가상의 체온, 압력, GPS 값 및 SOS 신호를 송신하는 테스트 도구

## 경고 판단 기준 (Thresholds)
- **주의 (Warning)**: 체온 37.0°C 이상 또는 안전모 착용 압력 500 미만 (미착용)
- **위험 (Emergency)**: SOS 버튼 활성화
