import { HiStar } from 'react-icons/hi2';

export interface Testimonial {
  name: string;
  location: string;
  text: string;
  visa: string;
  avatar: string;
}

interface TestimonialCardProps {
  testimonial: Testimonial;
}

export function TestimonialCard({ testimonial }: TestimonialCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-md p-6 flex flex-col gap-4 hover:shadow-lg hover:-translate-y-1 transition-all duration-200">
      {/* Stars */}
      <div className="flex gap-0.5">
        {[...Array(5)].map((_, i) => (
          <HiStar key={i} className="w-4 h-4 text-amber-400" />
        ))}
      </div>

      {/* Quote */}
      <p className="text-slate-700 text-sm leading-relaxed flex-1">
        &ldquo;{testimonial.text}&rdquo;
      </p>

      {/* Author */}
      <div className="flex items-center gap-3 pt-2 border-t border-slate-100">
        {/* Avatar initial */}
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
          {testimonial.avatar}
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-900">{testimonial.name}</p>
          <p className="text-xs text-slate-500">{testimonial.location}</p>
        </div>
        {/* Visa badge */}
        <span className="ml-auto inline-flex items-center gap-1 bg-blue-50 border border-blue-100 text-blue-700 text-xs font-semibold px-2.5 py-1 rounded-full">
          {testimonial.visa}
        </span>
      </div>
    </div>
  );
}
