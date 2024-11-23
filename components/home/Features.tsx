import { CheckCircleIcon } from '@heroicons/react/24/solid';

const features = [
  {
    title: 'Real-time Detection',
    description: 'Identify defects instantly with our advanced AI algorithms',
    icon: CheckCircleIcon,
  },
  {
    title: '99.9% Accuracy',
    description: 'Industry-leading precision in defect detection',
    icon: CheckCircleIcon,
  },
  {
    title: 'Easy Integration',
    description: 'Seamlessly integrate with your existing manufacturing systems',
    icon: CheckCircleIcon,
  },
  {
    title: 'Cost Effective',
    description: 'Reduce waste and improve quality control efficiency',
    icon: CheckCircleIcon,
  },
];

const Features = () => {
  return (
    <section className="py-24 bg-white" id="features">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            Advanced Features for Modern Manufacturing
          </h2>
          <p className="mt-4 text-xl text-gray-600">
            Our AI-powered solution provides comprehensive defect detection capabilities
          </p>
        </div>

        <div className="mt-20 grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => (
            <div key={index} className="relative">
              <div className="space-y-6">
                <feature.icon 
                  className="h-12 w-12 text-blue-600" 
                  aria-hidden="true" 
                />
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    {feature.title}
                  </h3>
                  <p className="mt-2 text-gray-600">
                    {feature.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features; 