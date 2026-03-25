# Cowork 세션 로그: 2026-03-08

## 주제: Cowork 리모트 워크플로우 세팅 + 앱스토어 배포 준비

### 논의 내용

1. **Cowork에 matecheck 폴더 연결 완료**
   - Desktop/matecheck ↔ Cowork 연결
   - GitHub remote: juuuno-coder/matecheck 확인

2. **리모트 워크플로우 설계**
   - Claude Code = 코딩 엔진 / Cowork = 프로젝트 매니저
   - 모바일 관리: Claude 앱(토론) + GitHub 앱(코드/이슈 관리)
   - 데스크탑↔모바일 연결은 GitHub를 허브로 활용

3. **스케줄 태스크 생성**
   - `matecheck-daily-status`: 평일 오전 9시 자동 실행
   - Git 변경사항, OKR 진행도, 에러 로그, 다음 할 일 요약

4. **Cowork vs Claude Code 역할 정리**
   - Cowork 강점: MCP 커넥터(Gmail, Calendar, Canva, Figma), 문서 생성(pptx/docx/xlsx/pdf), 브라우저 자동화, 스케줄 태스크, 시각적 아티팩트
   - 앱스토어 배포 준비(ASO, 심사 가이드 등)는 Cowork가 적합

5. **백업 문제 논의**
   - Cowork 세션은 앱 재설치 시 사라짐
   - 해결: 중요 결과물은 matecheck/docs/에 저장, Git 커밋
   - 세션 로그를 session_logs/에 저장하는 방식 도입

---

### 앱스토어 배포 에셋 제작 (Canva MCP 활용)

6. **앱 아이콘 제작**
   - Canva로 MateCheck 아이콘 생성 (집 + 체크마크, 코럴 색상)
   - 후보 1 선택 → `icon.png`, `adaptive-icon.png`, `splash-icon.png` 교체
   - 기존 Expo 기본 아이콘은 `_backup` 접미사로 백업
   - Canva 디자인 ID: `DAHDXhUyVCc`

7. **개인정보 처리방침 HTML 제작**
   - `docs/privacy.html` 작성 (모바일 반응형, MateCheck 브랜드 색상)
   - GitHub Pages로 호스팅 예정: `https://juuuno-coder.github.io/matecheck/privacy.html`

8. **Feature Graphic 제작 (Android)**
   - Canva로 "MATECHECK" 배너 디자인 제작
   - 851×315로 내보내기 후 Python(Pillow)으로 1024×500 리사이즈 완료
   - Canva 디자인 ID: `DAHDXj-GBbk`

9. **스토어 스크린샷 4장 제작**
   - Canva로 모바일 목업 스크린샷 4종 제작 (각 1080×1920)
   - 모두 후보 D 선택 후 PNG 내보내기 완료
   - 저장 경로: `frontend/assets/screenshots/`
     - `screenshot_01_hero.png` — 히어로 화면
     - `screenshot_02_tasks.png` — 할 일 관리
     - `screenshot_03_calendar.png` — 일정 관리
     - `screenshot_04_budget.png` — 가계부
   - Canva 디자인 IDs: `DAHDXpX-x34`, `DAHDXvIJJbA`, `DAHDXlDKu0g`, `DAHDXtd7x1E`

10. **배포 최종 체크리스트 작성**
    - `docs/DEPLOYMENT_CHECKLIST.md` 생성
    - 완료/대기/남은 작업을 체계적으로 정리

---

### 생성된 파일

| 파일 | 설명 |
|------|------|
| `docs/REMOTE_WORKFLOW_GUIDE.md` | 리모트 워크플로우 종합 가이드 |
| `docs/privacy.html` | 개인정보 처리방침 웹 페이지 |
| `docs/DEPLOYMENT_CHECKLIST.md` | 배포 최종 체크리스트 |
| `frontend/assets/icon.png` | 앱 아이콘 (Canva 제작) |
| `frontend/assets/adaptive-icon.png` | 어댑티브 아이콘 (Canva 제작) |
| `frontend/assets/splash-icon.png` | 스플래시 아이콘 (Canva 제작) |
| `frontend/assets/feature-graphic.png` | Android Feature Graphic (1024×500) |
| `frontend/assets/screenshots/*.png` | 스토어 스크린샷 4장 (1080×1920) |

### 개발자 계정 상태
- Apple Developer Program: 가입 완료, 승인 대기 (최대 48시간)
- Google Play Console: 가입 완료, 승인 대기

### 다음 할 일 (Claude Code에서 진행)
- [ ] GitHub Pages 활성화 → 개인정보 처리방침 URL 배포
- [ ] AdMob App ID 발급 → app.config.js 업데이트
- [ ] 개발자 계정 승인 확인 후 EAS 빌드 실행
- [ ] 스토어 등록 정보 입력 및 심사 제출
- [ ] Git 커밋 및 푸시 (에셋 파일 포함)
