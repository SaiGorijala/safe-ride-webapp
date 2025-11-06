import React from 'react';
import Card from './ui/Card';
import { QuestionMarkCircleIcon } from './Icons';

const Support: React.FC = () => {
  return (
    <Card>
      <div className="text-center">
        <QuestionMarkCircleIcon className="h-12 w-12 text-brand-accent mx-auto mb-4" />
        <h3 className="text-2xl font-bold mb-2">Contact Support</h3>
        <p className="text-gray-400 mb-6">
          Have an issue with a ride or a payment? Our support team is available 24/7.
        </p>
        <div className="space-y-4 text-left bg-gray-800 p-6 rounded-lg">
          <p><strong>Email:</strong> <a href="mailto:support@saferide.com" className="text-brand-primary hover:underline">support@saferide.com</a></p>
          <p><strong>Phone:</strong> <a href="tel:+18005551234" className="text-brand-primary hover:underline">1-800-555-1234</a></p>
          <p><strong>Live Chat:</strong> <span className="text-brand-primary">Available in App (Coming Soon!)</span></p>
        </div>
      </div>
    </Card>
  );
};

export default Support;