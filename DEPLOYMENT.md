# 배포 가이드

## 시크릿키 기반 관리자 회원가입 시스템

### 환경변수 설정

Cloudtype에서 다음 환경변수를 설정하세요:

1. **`SESSION_SECRET`** (필수)
   - 세션 토큰 서명에 사용되는 비밀키
   - 최소 32자 이상의 랜덤 문자열 권장
   - 생성 방법:
     ```bash
     openssl rand -hex 32
     ```
     또는
     ```bash
     node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
     ```

2. **`ADMIN_SECRET_KEY`** (필수)
   - 관리자 회원가입에 필요한 시크릿키
   - 코드에 포함되지 않으며 환경변수로만 관리
   - 강력한 랜덤 문자열 권장 (최소 32자)
   - 생성 방법:
     ```bash
     openssl rand -hex 32
     ```

3. **`DATABASE_URL`** (필수)
   - PostgreSQL 데이터베이스 연결 문자열
   - 형식: `postgresql://USER:PASSWORD@HOST:PORT/DB?schema=public`

### 초기 설정 절차

1. **Prisma 마이그레이션 실행**
   ```bash
   npx prisma migrate dev --name add_admin_model
   ```
   또는 Cloudtype 빌드 시 자동 실행되도록 설정

2. **환경변수 설정**
   - Cloudtype 대시보드에서 위의 환경변수들을 설정

3. **첫 관리자 계정 생성**
   - `/admin` 접속
   - "회원가입" 탭 선택
   - 시크릿키 입력 (환경변수 `ADMIN_SECRET_KEY` 값)
   - 이메일, 비밀번호, 이름 입력
   - 회원가입 완료

4. **로그인**
   - 회원가입 후 자동 로그인되거나
   - "로그인" 탭에서 이메일/비밀번호로 로그인

### 보안 주의사항

- ✅ 시크릿키는 코드에 포함하지 않음
- ✅ 시크릿키는 환경변수로만 관리
- ✅ 비밀번호는 bcrypt로 해싱되어 저장
- ✅ 세션 토큰은 HMAC 서명으로 보호
- ✅ Rate limiting으로 무차별 대입 방지

### 기존 시스템과의 차이

**이전:**
- 단일 비밀번호 기반 인증
- 환경변수에 비밀번호 해시 저장

**현재:**
- 시크릿키 기반 회원가입
- 이메일/비밀번호 기반 로그인
- 다중 관리자 계정 지원
- DB에 관리자 정보 저장

### 문제 해결

**회원가입이 안 될 때:**
- `ADMIN_SECRET_KEY` 환경변수가 설정되어 있는지 확인
- 시크릿키가 정확히 일치하는지 확인 (대소문자 구분)

**로그인이 안 될 때:**
- 이메일과 비밀번호가 정확한지 확인
- DB에 계정이 생성되어 있는지 확인

**세션 오류:**
- `SESSION_SECRET` 환경변수가 설정되어 있는지 확인
