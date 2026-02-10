import { Component, signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';

interface Question {
  id: number;
  text: string;
  emoji: string;
  options: { label: string; value: string; emoji: string }[];
}

interface Result {
  species: string;
  emoji: string;
  title: string;
  description: string;
  traits: string[];
  color: string;
  route: string;
}

const QUESTIONS: Question[] = [
  {
    id: 1,
    text: 'Where do you live?',
    emoji: '🏠',
    options: [
      { label: 'Apartment',        value: 'apartment', emoji: '🏢' },
      { label: 'House with yard',  value: 'house',     emoji: '🏡' },
      { label: 'Shared housing',   value: 'shared',    emoji: '🏘️' },
      { label: 'Large property',   value: 'large',     emoji: '🌳' },
    ]
  },
  {
    id: 2,
    text: 'How active is your lifestyle?',
    emoji: '🏃',
    options: [
      { label: 'Very active — I love outdoors',  value: 'very_active',  emoji: '⛰️' },
      { label: 'Moderate — daily walks',         value: 'moderate',     emoji: '🚶' },
      { label: 'Low — mostly relaxed indoors',   value: 'low',          emoji: '🛋️' },
      { label: 'Homebody — rarely go out',       value: 'homebody',     emoji: '🏠' },
    ]
  },
  {
    id: 3,
    text: 'How much time can you dedicate daily?',
    emoji: '⏰',
    options: [
      { label: 'Many hours — I work from home',  value: 'lots',     emoji: '🏠' },
      { label: '2–4 hours after work',           value: 'some',     emoji: '🕒' },
      { label: '1–2 hours on weekdays',          value: 'limited',  emoji: '📅' },
      { label: 'Weekends only',                  value: 'weekends', emoji: '📆' },
    ]
  },
  {
    id: 4,
    text: 'Do you have experience with animals?',
    emoji: '🎓',
    options: [
      { label: 'Yes — I have had several pets', value: 'experienced', emoji: '✅' },
      { label: 'Some — had a pet as a child',   value: 'some',        emoji: '🙂' },
      { label: 'First-time owner',              value: 'beginner',    emoji: '🌱' },
      { label: 'No pets but lots of research',  value: 'researched',  emoji: '📚' },
    ]
  },
  {
    id: 5,
    text: 'What matters most to you in a pet?',
    emoji: '💖',
    options: [
      { label: 'Cuddles & affection',    value: 'affection',     emoji: '🥰' },
      { label: 'Playfulness & energy',   value: 'playful',       emoji: '⚽' },
      { label: 'Independence & calm',    value: 'independent',   emoji: '😌' },
      { label: 'Intelligence & tricks',  value: 'intelligent',   emoji: '🧠' },
    ]
  },
  {
    id: 6,
    text: 'Any allergies or sensitivities?',
    emoji: '🤧',
    options: [
      { label: 'Yes — I prefer hypoallergenic', value: 'hypoallergenic', emoji: '😷' },
      { label: 'Mild — manageable with care',   value: 'mild',           emoji: '💊' },
      { label: 'None at all',                   value: 'none',           emoji: '✅' },
      { label: 'Not sure yet',                  value: 'unsure',         emoji: '🤔' },
    ]
  },
];

const RESULTS: Record<string, Result> = {
  dog: {
    species: 'Dog',
    emoji: '🐕',
    title: 'You\'re a Dog Person!',
    description: 'Loyal, playful, and full of love — a dog will match your energy and fill your life with unconditional companionship.',
    traits: ['Loyal companion', 'Great for active lifestyles', 'Loves outdoor adventures', 'Forms deep emotional bonds'],
    color: '#f59e0b',
    route: '/animals'
  },
  cat: {
    species: 'Cat',
    emoji: '🐈',
    title: 'You\'re a Cat Person!',
    description: 'Independent yet affectionate — a cat fits perfectly into a busy lifestyle while still giving you love on their own terms.',
    traits: ['Low maintenance', 'Perfect for apartments', 'Independent & calm', 'Great for beginners'],
    color: '#8b5cf6',
    route: '/animals'
  },
  rabbit: {
    species: 'Rabbit',
    emoji: '🐇',
    title: 'You\'re a Rabbit Person!',
    description: 'Gentle and curious, rabbits are quiet companions perfect for calmer environments. They\'re intelligent and incredibly endearing.',
    traits: ['Quiet & gentle', 'Hypoallergenic', 'Great for small spaces', 'Low exercise needs'],
    color: '#ec4899',
    route: '/animals'
  },
  bird: {
    species: 'Bird',
    emoji: '🦜',
    title: 'You\'re a Bird Person!',
    description: 'Colorful, intelligent, and entertaining — birds are surprisingly interactive pets and perfect if you want a companion that talks back!',
    traits: ['Highly intelligent', 'Great for apartments', 'Low physical care', 'Fun & social personality'],
    color: '#14b8a6',
    route: '/animals'
  },
};

@Component({
  selector: 'app-quiz',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="quiz-page page-enter">

      @if (!started()) {
        <!-- ── Landing ── -->
        <div class="quiz-landing">
          <div class="landing-glow"></div>
          <div class="landing-emoji">🐾</div>
          <h1>Find Your Perfect Pet Match</h1>
          <p>Answer 6 quick questions and we'll recommend the best type of animal companion for your lifestyle.</p>
          <div class="species-preview">
            @for (r of previewResults; track r.species) {
              <div class="species-chip" [style.border-color]="r.color"><span>{{ r.emoji }}</span> {{ r.species }}</div>
            }
          </div>
          <button class="btn-start" (click)="start()">
            <i class="bi bi-play-circle-fill"></i> Start the Quiz
          </button>
        </div>
      }

      @if (started() && !result()) {
        <!-- ── Active Question ── -->
        <div class="quiz-card glass-card">
          <!-- Progress bar -->
          <div class="quiz-progress-bar">
            <div class="quiz-progress-fill" [style.width.%]="progressPct()"></div>
          </div>

          <div class="quiz-meta">
            <span class="question-count">Question {{ currentQ() + 1 }} of {{ questions.length }}</span>
            <button class="restart-btn" (click)="reset()"><i class="bi bi-arrow-counterclockwise"></i> Restart</button>
          </div>

          <div class="question-emoji">{{ questions[currentQ()].emoji }}</div>
          <h2 class="question-text">{{ questions[currentQ()].text }}</h2>

          <div class="options-grid">
            @for (opt of questions[currentQ()].options; track opt.value) {
              <button class="option-btn" [class.selected]="answers()[currentQ()] === opt.value"
                      (click)="selectAnswer(opt.value)">
                <span class="opt-emoji">{{ opt.emoji }}</span>
                {{ opt.label }}
              </button>
            }
          </div>

          <div class="quiz-nav">
            <button class="nav-btn" (click)="prev()" [disabled]="currentQ() === 0">
              <i class="bi bi-arrow-left"></i> Back
            </button>
            <button class="nav-btn next-btn" (click)="next()" [disabled]="!answers()[currentQ()]">
              {{ currentQ() === questions.length - 1 ? 'See Results 🎉' : 'Next' }}
              <i class="bi bi-arrow-right"></i>
            </button>
          </div>
        </div>
      }

      @if (result()) {
        <!-- ── Result ── -->
        <div class="result-card glass-card" [style.border-color]="result()!.color + '40'">
          <div class="result-emoji" [style.background]="result()!.color + '20'">{{ result()!.emoji }}</div>
          <h2 class="result-title" [style.color]="result()!.color">{{ result()!.title }}</h2>
          <p class="result-desc">{{ result()!.description }}</p>

          <div class="result-traits">
            @for (t of result()!.traits; track t) {
              <span class="trait-chip" [style.border-color]="result()!.color + '50'" [style.color]="result()!.color">
                <i class="bi bi-check-circle-fill"></i> {{ t }}
              </span>
            }
          </div>

          <div class="result-cta">
            <a [routerLink]="result()!.route" class="btn-primary">
              <i class="bi bi-heart-fill"></i> Browse Available {{ result()!.species }}s
            </a>
            <button class="btn-outline btn-sm" (click)="reset()">
              <i class="bi bi-arrow-repeat"></i> Try Again
            </button>
          </div>

          <div class="share-hint">💡 Tell a friend — they might be the perfect match for a different pet!</div>
        </div>
      }
    </div>
  `,
  styles: [`
    .quiz-page { max-width:680px; margin:0 auto; }

    /* Landing */
    .quiz-landing { text-align:center; padding:3rem 1rem; position:relative; overflow:hidden; }
    .landing-glow { position:absolute; top:0; left:50%; transform:translateX(-50%); width:380px; height:220px; background:radial-gradient(ellipse,rgba(245,158,11,0.15),transparent 70%); pointer-events:none; }
    .landing-emoji { font-size:4rem; margin-bottom:1rem; animation:bounce 2s infinite; }
    @keyframes bounce { 0%,100%{transform:translateY(0);} 50%{transform:translateY(-10px);} }
    .quiz-landing h1 { font-size:2rem; font-weight:900; background:linear-gradient(135deg,#f9fafb,#f59e0b); -webkit-background-clip:text; -webkit-text-fill-color:transparent; margin:0 0 0.75rem; }
    .quiz-landing p { color:#9ca3af; font-size:1rem; max-width:480px; margin:0 auto 1.5rem; }
    .species-preview { display:flex; justify-content:center; gap:0.75rem; flex-wrap:wrap; margin-bottom:2rem; }
    .species-chip { background:rgba(31,41,55,0.7); border:1px solid; padding:0.4rem 0.9rem; border-radius:999px; font-size:0.82rem; font-weight:600; color:#d1d5db; display:flex; align-items:center; gap:0.4rem; }
    .btn-start { background:linear-gradient(135deg,#d97706,#f59e0b); color:white; border:none; padding:0.85rem 2.5rem; border-radius:0.75rem; font-size:1rem; font-weight:700; cursor:pointer; transition:all 0.2s; display:inline-flex; align-items:center; gap:0.6rem; }
    .btn-start:hover { transform:translateY(-2px); box-shadow:0 8px 24px rgba(245,158,11,0.4); }

    /* Active question */
    .quiz-card { padding:2rem; margin:1.5rem 0; }
    .quiz-progress-bar { height:4px; background:#1f2937; border-radius:999px; margin-bottom:1.5rem; overflow:hidden; }
    .quiz-progress-fill { height:100%; background:linear-gradient(90deg,#f59e0b,#fbbf24); border-radius:999px; transition:width 0.4s ease; }
    .quiz-meta { display:flex; justify-content:space-between; align-items:center; margin-bottom:1.25rem; }
    .question-count { color:#6b7280; font-size:0.8rem; font-weight:500; }
    .restart-btn { background:none; border:none; color:#6b7280; cursor:pointer; font-size:0.75rem; display:flex; align-items:center; gap:0.3rem; }
    .restart-btn:hover { color:#f87171; }
    .question-emoji { font-size:2.5rem; text-align:center; margin-bottom:0.75rem; }
    .question-text { font-size:1.25rem; font-weight:800; color:#f9fafb; text-align:center; margin:0 0 1.5rem; }
    .options-grid { display:grid; grid-template-columns:1fr 1fr; gap:0.75rem; margin-bottom:1.5rem; }
    .option-btn { background:rgba(31,41,55,0.5); border:1px solid rgba(255,255,255,0.08); color:#d1d5db; padding:0.9rem; border-radius:0.6rem; cursor:pointer; font-size:0.875rem; font-weight:500; transition:all 0.2s; display:flex; align-items:center; gap:0.6rem; text-align:left; }
    .option-btn:hover { border-color:#f59e0b; background:rgba(245,158,11,0.08); color:#fbbf24; }
    .option-btn.selected { border-color:#f59e0b; background:rgba(245,158,11,0.12); color:#fbbf24; }
    .opt-emoji { font-size:1.25rem; }
    .quiz-nav { display:flex; justify-content:space-between; }
    .nav-btn { background:rgba(31,41,55,0.5); border:1px solid rgba(255,255,255,0.1); color:#d1d5db; padding:0.6rem 1.25rem; border-radius:0.5rem; cursor:pointer; font-size:0.875rem; font-weight:600; display:flex; align-items:center; gap:0.4rem; transition:all 0.2s; }
    .nav-btn:disabled { opacity:0.3; cursor:not-allowed; }
    .nav-btn:hover:not(:disabled) { border-color:#f59e0b; color:#f59e0b; }
    .next-btn { background:linear-gradient(135deg,#d97706,#f59e0b); color:white; border:none; }
    .next-btn:hover:not(:disabled) { transform:translateY(-1px); box-shadow:0 4px 12px rgba(245,158,11,0.4); }

    /* Result */
    .result-card { padding:2.5rem; text-align:center; border:1px solid; border-radius:1rem; }
    .result-emoji { font-size:4rem; width:100px; height:100px; border-radius:50%; display:flex; align-items:center; justify-content:center; margin:0 auto 1.25rem; }
    .result-title { font-size:1.75rem; font-weight:900; margin:0 0 0.75rem; }
    .result-desc { color:#9ca3af; font-size:0.95rem; max-width:480px; margin:0 auto 1.5rem; line-height:1.6; }
    .result-traits { display:flex; flex-wrap:wrap; gap:0.5rem; justify-content:center; margin-bottom:2rem; }
    .trait-chip { border:1px solid; padding:0.3rem 0.75rem; border-radius:999px; font-size:0.78rem; font-weight:600; display:flex; align-items:center; gap:0.3rem; }
    .result-cta { display:flex; gap:1rem; justify-content:center; flex-wrap:wrap; margin-bottom:1.5rem; }
    .btn-sm { font-size:0.85rem; padding:0.55rem 1rem; }
    .share-hint { color:#4b5563; font-size:0.78rem; }
    @media(max-width:520px) { .options-grid{grid-template-columns:1fr;} .quiz-landing h1{font-size:1.5rem;} }
  `]
})
export class QuizComponent {
  readonly questions = QUESTIONS;
  readonly previewResults = Object.values(RESULTS);

  started = signal(false);
  currentQ = signal(0);
  answers = signal<Record<number, string>>({});
  result = signal<Result | null>(null);

  progressPct = computed(() =>
    Math.round((Object.keys(this.answers()).length / this.questions.length) * 100)
  );

  start() { this.started.set(true); }

  selectAnswer(value: string) {
    this.answers.update(a => ({ ...a, [this.currentQ()]: value }));
  }

  next() {
    if (this.currentQ() < this.questions.length - 1) {
      this.currentQ.update(q => q + 1);
    } else {
      this.calculateResult();
    }
  }

  prev() {
    if (this.currentQ() > 0) this.currentQ.update(q => q - 1);
  }

  reset() {
    this.started.set(false);
    this.currentQ.set(0);
    this.answers.set({});
    this.result.set(null);
  }

  private calculateResult() {
    const a = this.answers();

    // Scoring logic
    let scores: Record<string, number> = { dog: 0, cat: 0, rabbit: 0, bird: 0 };

    // Q0: living space
    if (a[0] === 'house' || a[0] === 'large')  scores['dog'] += 3;
    if (a[0] === 'apartment' || a[0] === 'shared') { scores['cat'] += 2; scores['rabbit'] += 2; scores['bird'] += 2; }

    // Q1: activity level
    if (a[1] === 'very_active' || a[1] === 'moderate') scores['dog'] += 3;
    if (a[1] === 'low' || a[1] === 'homebody') { scores['cat'] += 2; scores['rabbit'] += 1; scores['bird'] += 1; }

    // Q2: time available
    if (a[2] === 'lots' || a[2] === 'some') { scores['dog'] += 2; scores['bird'] += 1; }
    if (a[2] === 'limited' || a[2] === 'weekends') { scores['cat'] += 2; scores['rabbit'] += 2; }

    // Q3: experience
    if (a[3] === 'experienced') { scores['dog'] += 2; }
    if (a[3] === 'beginner') { scores['cat'] += 3; scores['rabbit'] += 1; }
    if (a[3] === 'researched') scores['bird'] += 2;

    // Q4: what matters most
    if (a[4] === 'affection') { scores['dog'] += 3; scores['cat'] += 1; }
    if (a[4] === 'playful') { scores['dog'] += 2; scores['bird'] += 1; }
    if (a[4] === 'independent') scores['cat'] += 3;
    if (a[4] === 'intelligent') { scores['bird'] += 3; scores['dog'] += 1; }

    // Q5: allergies
    if (a[5] === 'hypoallergenic' || a[5] === 'mild') { scores['rabbit'] += 2; scores['bird'] += 2; }

    const best = Object.entries(scores).sort((a, b) => b[1] - a[1])[0][0];
    this.result.set(RESULTS[best]);
  }
}
