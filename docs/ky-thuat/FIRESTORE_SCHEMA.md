# OFFICIAL FIRESTORE SCHEMA & DOCUMENTATION (v1.0.0)

## 1. COLLECTIONS STRUCTURE OVERVIEW

```
/schools/{schoolId}
  ├── /members/{memberUid}
  ├── /teams/{teamId}
  ├── /joinRequests/{requestId}
  └── /auditLogs/{logId}

/classes/{classId}
  └── /students/{studentId}

/quizzes/{quizId}

/rooms/{roomId}
  ├── /roster/{studentId}
  ├── /participants/{studentId}
  ├── /liveQuestions/{questionId}
  ├── /submissions/{submissionId}
  ├── /scores/{studentId}
  ├── /games/{gameId}
  └── /summary/main

/practiceSets/{setId}
  └── /responses/{responseId}

/history/{historyId}
/pilotFeedback/{feedbackId}
```

---

## 2. DOCUMENT SCHEMAS

### A. School Member (`schools/{schoolId}/members/{uid}`)
```json
{
  "uid": "string",
  "displayName": "string",
  "email": "string",
  "role": "SCHOOL_ADMIN | TEAM_LEADER | TEACHER",
  "teamIds": ["array of teamId strings"],
  "status": "ACTIVE | DISABLED | INVITED",
  "joinedAt": "ISO date string",
  "updatedAt": "ISO date string"
}
```

### B. Room (`rooms/{roomId}`)
```json
{
  "id": "string",
  "roomCode": "6-digit PIN string",
  "teacherId": "string",
  "classId": "string",
  "className": "string",
  "subject": "string",
  "quizId": "string",
  "quizTitle": "string",
  "status": "WAITING | ACTIVE | FINISHED",
  "activeQuestionId": "string",
  "createdAt": "ISO date string",
  "schemaVersion": "1.0.0"
}
```

### C. Live Submission (`rooms/{roomId}/submissions/{submissionId}`)
```json
{
  "questionId": "string",
  "studentId": "string",
  "studentName": "string",
  "answer": "string",
  "isCorrect": "boolean",
  "submittedAt": "ISO date string"
}
```
