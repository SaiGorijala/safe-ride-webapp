import React, { useState } from 'react';
import Card from './ui/Card';
import { BookOpenIcon, ChevronDownIcon, ChevronUpIcon } from './Icons';

const faqs = [
  {
    q: 'How does SafeRide work?',
    a: 'You book a professional driver who comes to your location to drive you home safely in your own car. This eliminates the need to leave your car behind.'
  },
  {
    q: 'Is my car insured during the ride?',
    a: 'Yes, all our drivers are covered by our comprehensive insurance policy that protects your vehicle for the duration of the trip.'
  },
  {
    q: 'How is the fare calculated?',
    a: 'The fare is calculated based on the distance of the trip and the time taken. You will see an estimated fare before you confirm your booking.'
  },
  {
    q: 'Can I cancel a ride?',
    a: 'Yes, you can cancel a ride. However, a cancellation fee may apply if you cancel after a driver has already been dispatched.'
  }
];

const FAQ: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <Card>
        <div className="flex items-center justify-center gap-3 mb-6">
            <BookOpenIcon className="h-8 w-8 text-brand-accent" />
            <h3 className="text-2xl font-bold">Frequently Asked Questions</h3>
        </div>
      
      <div className="space-y-4">
        {faqs.map((faq, index) => (
          <div key={index} className="bg-gray-800 rounded-lg p-4">
            <button
              onClick={() => toggleFAQ(index)}
              className="w-full flex justify-between items-center text-left font-semibold"
            >
              <span>{faq.q}</span>
              {openIndex === index ? <ChevronUpIcon className="h-5 w-5" /> : <ChevronDownIcon className="h-5 w-5" />}
            </button>
            {openIndex === index && (
              <p className="mt-3 pt-3 border-t border-gray-700 text-gray-400 animate-fade-in-up">
                {faq.a}
              </p>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
};

export default FAQ;