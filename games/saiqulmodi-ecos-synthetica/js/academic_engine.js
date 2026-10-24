class AcademicEngine {
    constructor() {
        this.questions = [];
        this.activeQuestion = null;
        this.isLoaded = false;
    }

    async loadBank(url = 'data/neet_academic_bank.json') {
        try {
            const res = await fetch(url);
            this.questions = await res.json();
            this.isLoaded = true;
            console.log(`[AcademicEngine] Loaded ${this.questions.length} questions.`);
        } catch (err) {
            console.error('[AcademicEngine] Error loading question bank:', err);
        }
    }

    getRandomQuestion(filters = {}) {
        if (!this.isLoaded || this.questions.length === 0) return null;

        let pool = this.questions;
        if (filters.subject) {
            pool = pool.filter(q => q.subject.toLowerCase() === filters.subject.toLowerCase());
        }
        if (filters.grade) {
            pool = pool.filter(q => q.grade === filters.grade);
        }
        if (filters.neetOnly) {
            pool = pool.filter(q => q.neet_high_yield === true);
        }

        if (pool.length === 0) pool = this.questions; // Fallback to full pool if filters yield empty
        this.activeQuestion = pool[Math.floor(Math.random() * pool.length)];
        return this.activeQuestion;
    }

    checkAnswer(choiceIndex) {
        if (!this.activeQuestion) return null;
        const correct = choiceIndex === this.activeQuestion.answer;
        return {
            correct: correct,
            correctAnswerIndex: this.activeQuestion.answer,
            explanation: this.activeQuestion.explanation,
            reward: correct ? this.activeQuestion.reward : { energy: 0, xp: 0 }
        };
    }
}

window.academicEngine = new AcademicEngine();