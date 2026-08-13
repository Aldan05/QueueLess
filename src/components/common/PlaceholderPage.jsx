const PlaceholderPage = ({ title }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 h-[calc(100vh-12rem)] flex flex-col items-center justify-center text-center">
      <div className="w-16 h-16 bg-blue-50 text-primary rounded-2xl flex items-center justify-center mb-6 shadow-inner">
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
      </div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">{title}</h1>
      <p className="text-gray-500 max-w-md">
        This page is currently under construction. Check back soon for updates to the {title.toLowerCase()} module.
      </p>
    </div>
  );
};

export default PlaceholderPage;
