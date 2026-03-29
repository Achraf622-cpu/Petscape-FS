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
      { label: 'Apartment', value: 'apartment', emoji: '🏢' },
      { label: 'House with yard', value: 'house', emoji: '🏡' },
      { label: 'Shared housing', value: 'shared', emoji: '🏘️' },
      { label: 'Large property', value: 'large', emoji: '🌳' },
    ],
  },
  {
    id: 2,
    text: 'How active is your lifestyle?',
    emoji: '🏃',
    options: [
      { label: 'Very active — I love outdoors', value: 'very_active', emoji: '⛰️' },
      { label: 'Moderate — daily walks', value: 'moderate', emoji: '🚶' },
      { label: 'Low — mostly relaxed indoors', value: 'low', emoji: '🛋️' },
      { label: 'Homebody — rarely go out', value: 'homebody', emoji: '🏠' },
    ],
  },
  {
    id: 3,
    text: 'How much time can you dedicate daily?',
    emoji: '⏰',
    options: [
      { label: 'Many hours — I work from home', value: 'lots', emoji: '🏠' },
      { label: '2–4 hours after work', value: 'some', emoji: '🕒' },
      { label: '1–2 hours on weekdays', value: 'limited', emoji: '📅' },
      { label: 'Weekends only', value: 'weekends', emoji: '📆' },
    ],
  },
  {
    id: 4,
    text: 'Do you have experience with animals?',
    emoji: '🎓',
    options: [
      { label: 'Yes — I have had several pets', value: 'experienced', emoji: '✅' },
      { label: 'Some — had a pet as a child', value: 'some', emoji: '🙂' },
      { label: 'First-time owner', value: 'beginner', emoji: '🌱' },
      { label: 'No pets but lots of research', value: 'researched', emoji: '📚' },
    ],
  },
  {
    id: 5,
    text: 'What matters most to you in a pet?',
    emoji: '💖',
    options: [
      { label: 'Cuddles & affection', value: 'affection', emoji: '🥰' },
      { label: 'Playfulness & energy', value: 'playful', emoji: '⚽' },
      { label: 'Independence & calm', value: 'independent', emoji: '😌' },
      { label: 'Intelligence & tricks', value: 'intelligent', emoji: '🧠' },
    ],
  },
  {
    id: 6,
    text: 'Any allergies or sensitivities?',
    emoji: '🤧',
    options: [
      { label: 'Yes — I prefer hypoallergenic', value: 'hypoallergenic', emoji: '😷' },
      { label: 'Mild — manageable with care', value: 'mild', emoji: '💊' },
      { label: 'None at all', value: 'none', emoji: '✅' },
      { label: 'Not sure yet', value: 'unsure', emoji: '🤔' },
    ],
  },
];

const RESULTS: Record<string, Result> = {
  dog: {
    species: 'Dog',
    emoji: '🐕',
    title: "You're a Dog Person!",
    description:
      'Loyal, playful, and full of love — a dog will match your energy and fill your life with unconditional companionship.',
    traits: [
      'Loyal companion',
      'Great for active lifestyles',
      'Loves outdoor adventures',
      'Forms deep emotional bonds',
    ],
    color: '#f59e0b',
    route: '/animals',
  },
  cat: {
    species: 'Cat',
    emoji: '🐈',
    title: "You're a Cat Person!",
    description:
      'Independent yet affectionate — a cat fits perfectly into a busy lifestyle while still giving you love on their own terms.',
    traits: [
      'Low maintenance',
      'Perfect for apartments',
      'Independent & calm',
      'Great for beginners',
    ],
    color: '#8b5cf6',
    route: '/animals',
  },
  rabbit: {
    species: 'Rabbit',
    emoji: '🐇',
    title: "You're a Rabbit Person!",
    description:
      "Gentle and curious, rabbits are quiet companions perfect for calmer environments. They're intelligent and incredibly endearing.",
    traits: ['Quiet & gentle', 'Hypoallergenic', 'Great for small spaces', 'Low exercise needs'],
    color: '#ec4899',
    route: '/animals',
  },
  bird: {
    species: 'Bird',
    emoji: '🦜',
    title: "You're a Bird Person!",
    description:
      'Colorful, intelligent, and entertaining — birds are surprisingly interactive pets and perfect if you want a companion that talks back!',
    traits: [
      'Highly intelligent',
      'Great for apartments',
      'Low physical care',
      'Fun & social personality',
    ],
    color: '#14b8a6',
    route: '/animals',
  },
};

@Component({
  selector: 'app-quiz',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './quiz.component.html',
  styleUrl: './quiz.component.css',
})
export class QuizComponent {
  readonly questions = QUESTIONS;
  readonly previewResults = Object.values(RESULTS);

  started = signal(false);
  currentQ = signal(0);
  answers = signal<Record<number, string>>({});
  result = signal<Result | null>(null);

  progressPct = computed(() =>
    Math.round((Object.keys(this.answers()).length / this.questions.length) * 100),
  );

  start() {
    this.started.set(true);
  }

  selectAnswer(value: string) {
    this.answers.update((a) => ({ ...a, [this.currentQ()]: value }));
  }

  next() {
    if (this.currentQ() < this.questions.length - 1) {
      this.currentQ.update((q) => q + 1);
    } else {
      this.calculateResult();
    }
  }

  prev() {
    if (this.currentQ() > 0) this.currentQ.update((q) => q - 1);
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
    if (a[0] === 'house' || a[0] === 'large') scores['dog'] += 3;
    if (a[0] === 'apartment' || a[0] === 'shared') {
      scores['cat'] += 2;
      scores['rabbit'] += 2;
      scores['bird'] += 2;
    }

    // Q1: activity level
    if (a[1] === 'very_active' || a[1] === 'moderate') scores['dog'] += 3;
    if (a[1] === 'low' || a[1] === 'homebody') {
      scores['cat'] += 2;
      scores['rabbit'] += 1;
      scores['bird'] += 1;
    }

    // Q2: time available
    if (a[2] === 'lots' || a[2] === 'some') {
      scores['dog'] += 2;
      scores['bird'] += 1;
    }
    if (a[2] === 'limited' || a[2] === 'weekends') {
      scores['cat'] += 2;
      scores['rabbit'] += 2;
    }

    // Q3: experience
    if (a[3] === 'experienced') {
      scores['dog'] += 2;
    }
    if (a[3] === 'beginner') {
      scores['cat'] += 3;
      scores['rabbit'] += 1;
    }
    if (a[3] === 'researched') scores['bird'] += 2;

    // Q4: what matters most
    if (a[4] === 'affection') {
      scores['dog'] += 3;
      scores['cat'] += 1;
    }
    if (a[4] === 'playful') {
      scores['dog'] += 2;
      scores['bird'] += 1;
    }
    if (a[4] === 'independent') scores['cat'] += 3;
    if (a[4] === 'intelligent') {
      scores['bird'] += 3;
      scores['dog'] += 1;
    }

    // Q5: allergies
    if (a[5] === 'hypoallergenic' || a[5] === 'mild') {
      scores['rabbit'] += 2;
      scores['bird'] += 2;
    }

    const best = Object.entries(scores).sort((a, b) => b[1] - a[1])[0][0];
    this.result.set(RESULTS[best]);
  }
}
