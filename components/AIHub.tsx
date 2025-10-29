import React, { useState } from 'react';
import { TabConfig } from '../types';
import AIChat from './AIChat';
import ImageGenerator from './ImageGenerator';
import ImageAnalyzer from './ImageAnalyzer';
import VideoProcessor from './VideoProcessor';
import AudioInterface from './AudioInterface';
import ComplexTaskAnalyzer from './ComplexTaskAnalyzer';
import QuickResponse from './QuickResponse';

const AIHub: React.FC = () => {
  const tabs: TabConfig[] = [
    { id: 'chat', name: 'AI Chat', component: () => <AIChat title="AI Chat (Gemini Flash)" /> },
    { id: 'search-grounding', name: 'Search AI', component: () => <AIChat title="Search AI (Google Search Grounding)" useGoogleSearch={true} /> },
    { id: 'maps-grounding', name: 'Local Search AI', component: () => <AIChat title="Local Search AI (Google Maps Grounding)" useGoogleMaps={true} /> },
    { id: 'image-gen', name: 'Generate Image', component: ImageGenerator },
    { id: 'image-analyze-edit', name: 'Analyze & Edit Image', component: ImageAnalyzer },
    { id: 'video-process', name: 'Video AI', component: VideoProcessor },
    { id: 'audio-interface', name: 'Live & TTS Audio', component: AudioInterface },
    { id: 'complex-task', name: 'Complex Task AI', component: ComplexTaskAnalyzer },
    { id: 'quick-response', name: 'Quick Response AI', component: QuickResponse },
  ];

  const [activeTab, setActiveTab] = useState<string>(tabs[0].id);

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component || (() => <p>Select a tool</p>);

  return (
    <section id="ai-hub" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-10 text-teal-800">Explore Our AI Automation Tools</h2>

        <div className="flex flex-col md:flex-row bg-white rounded-lg shadow-xl overflow-hidden min-h-[70vh]">
          {/* Sidebar Navigation */}
          <nav className="md:w-1/4 bg-gray-800 text-white p-4 flex flex-col justify-start flex-shrink-0">
            <h3 className="text-lg font-semibold mb-4 border-b border-gray-600 pb-2">AI Tools</h3>
            <ul className="space-y-2">
              {tabs.map((tab) => (
                <li key={tab.id}>
                  <button
                    onClick={() => setActiveTab(tab.id)}
                    className={`block w-full text-left py-2 px-3 rounded-lg transition-colors duration-200 ${
                      activeTab === tab.id
                        ? 'bg-teal-600 text-white shadow-md'
                        : 'hover:bg-gray-700 text-gray-200'
                    }`}
                  >
                    {tab.name}
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          {/* Content Area */}
          <div className="md:w-3/4 p-6 bg-white flex-1">
            <ActiveComponent />
          </div>
        </div>
      </div>
    </section>
  );
};

export default AIHub;