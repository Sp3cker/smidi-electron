import React from 'react';
import Button from './Button';

const ButtonDemo: React.FC = () => {
  return (
    <div className="p-6 space-y-8 bg-zinc-800 min-h-screen">
      <h1 className="text-4xl font-bold text-stone-100 font-pkmnem mb-8">
        Button Component Demo
      </h1>
      
      <div className="space-y-8">
        {/* Variants */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-stone-100 font-calamity">Variants</h2>
          <div className="flex gap-4 flex-wrap">
            <Button variant="primary">Primary Button</Button>
            <Button variant="secondary">Secondary Button</Button>
            <Button variant="danger">Danger Button</Button>
          </div>
        </div>

        {/* Sizes */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-stone-100 font-calamity">Sizes</h2>
          <div className="flex gap-4 flex-wrap items-center">
            <Button size="sm">Small</Button>
            <Button size="md">Medium</Button>
            <Button size="lg">Large</Button>
          </div>
        </div>

        {/* States */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-stone-100 font-calamity">States</h2>
          <div className="flex gap-4 flex-wrap">
            <Button>Normal</Button>
            <Button disabled>Disabled</Button>
            <Button variant="danger" disabled>Disabled Danger</Button>
          </div>
        </div>

        {/* Interactive */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-stone-100 font-calamity">Interactive</h2>
          <div className="flex gap-4 flex-wrap">
            <Button onClick={() => alert('Button clicked!')}>Click Me</Button>
            <Button variant="secondary" onClick={() => console.log('Secondary clicked')}>
              Console Log
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ButtonDemo;
