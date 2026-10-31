from fastapi.testclient import TestClient

import main


def client_for(tmp_path, monkeypatch):
    database_path = tmp_path / 'test.db'
    monkeypatch.setattr(main, 'DATABASE_PATH', str(database_path))
    main.initialize_database()
    return TestClient(main.app)


def test_health_endpoint(tmp_path, monkeypatch):
    with client_for(tmp_path, monkeypatch) as client:
        response = client.get('/health')

    assert response.status_code == 200
    assert response.json() == {'status': 'ok'}


def test_custom_job_matching_returns_score(tmp_path, monkeypatch):
    with client_for(tmp_path, monkeypatch) as client:
        with main.connection() as database:
            database.execute(
                "INSERT INTO resumes (user_id, file_path, parsed_text, skills) VALUES (?, ?, ?, ?)",
                (1, 'resume.pdf', 'Python FastAPI Docker', 'Parsed'),
            )
            database.commit()

        response = client.post(
            '/api/resumes/1/match_custom',
            json={'title': 'Backend Engineer', 'company': 'Example Inc', 'jd_text': 'Python FastAPI experience required'},
        )

    assert response.status_code == 200
    match = response.json()['matches'][0]
    assert match['title'] == 'Backend Engineer'
    assert match['match_score'] > 0


def test_fallback_analysis_identifies_missing_skills():
    result = main.fallback_analysis('Python experience', 'Python and Docker experience required')

    assert 'Docker' in result['missing_skills']
    assert result['recommendations']
