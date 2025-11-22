'use client';

import React, { useState, useEffect } from 'react';
import { ISOChecklistSection, ISOChecklistItem } from '@/lib/audit/iso-checklist';

interface ChecklistConfigurationProps {
  onSave?: (checklist: ISOChecklistSection[]) => Promise<void>;
  readOnly?: boolean;
}

export default function ChecklistConfiguration({ 
  onSave, 
  readOnly = false 
}: ChecklistConfigurationProps) {
  const [sections, setSections] = useState<ISOChecklistSection[]>([]);
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadChecklist();
  }, []);

  const loadChecklist = async () => {
    try {
      const response = await fetch('/api/audit/checklist');
      if (response.ok) {
        const data = await response.json();
        setSections(data.sections || []);
      }
    } catch (error) {
      console.error('Failed to load checklist:', error);
      setMessage({ type: 'error', text: 'Failed to load checklist configuration' });
    }
  };

  const handleSaveChecklist = async () => {
    if (readOnly) return;
    
    setLoading(true);
    setMessage(null);
    
    try {
      if (onSave) {
        await onSave(sections);
      } else {
        const response = await fetch('/api/audit/checklist', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sections }),
        });

        if (!response.ok) {
          throw new Error('Failed to save checklist');
        }
      }
      
      setMessage({ type: 'success', text: 'Checklist configuration saved successfully' });
    } catch (error) {
      console.error('Save error:', error);
      setMessage({ type: 'error', text: 'Failed to save checklist configuration' });
    } finally {
      setLoading(false);
    }
  };

  const updateSection = (sectionId: string, updates: Partial<ISOChecklistSection>) => {
    setSections(prev => prev.map(section => 
      section.id === sectionId ? { ...section, ...updates } : section
    ));
  };

  const updateItem = (sectionId: string, itemId: string, updates: Partial<ISOChecklistItem>) => {
    setSections(prev => prev.map(section => {
      if (section.id === sectionId) {
        return {
          ...section,
          items: section.items.map(item => 
            item.id === itemId ? { ...item, ...updates } : item
          )
        };
      }
      return section;
    }));
  };

  const addSection = () => {
    const newSection: ISOChecklistSection = {
      id: `section_${Date.now()}`,
      title: 'New Section',
      clauseRange: '0.0-0.0',
      items: []
    };
    setSections(prev => [...prev, newSection]);
    setEditingSection(newSection.id);
  };

  const deleteSection = (sectionId: string) => {
    if (confirm('Are you sure you want to delete this section?')) {
      setSections(prev => prev.filter(s => s.id !== sectionId));
    }
  };

  const addItem = (sectionId: string) => {
    const newItem: ISOChecklistItem = {
      id: `item_${Date.now()}`,
      clauseRef: '0.0',
      section: 'New Item',
      question: 'Enter question here',
      helpText: 'Enter help text here',
      responseType: 'pass_fail_na',
      required: true,
      weight: 1,
      correctiveActionTemplates: [],
      evidenceRequired: false
    };

    setSections(prev => prev.map(section => {
      if (section.id === sectionId) {
        return {
          ...section,
          items: [...section.items, newItem]
        };
      }
      return section;
    }));
    setEditingItem(newItem.id);
  };

  const deleteItem = (sectionId: string, itemId: string) => {
    if (confirm('Are you sure you want to delete this item?')) {
      setSections(prev => prev.map(section => {
        if (section.id === sectionId) {
          return {
            ...section,
            items: section.items.filter(item => item.id !== itemId)
          };
        }
        return section;
      }));
    }
  };

  const addCorrectiveActionTemplate = (sectionId: string, itemId: string) => {
    const template = prompt('Enter corrective action template:');
    if (template) {
      updateItem(sectionId, itemId, {
        correctiveActionTemplates: [
          ...sections.find(s => s.id === sectionId)?.items.find(i => i.id === itemId)?.correctiveActionTemplates || [],
          template
        ]
      });
    }
  };

  const removeCorrectiveActionTemplate = (sectionId: string, itemId: string, index: number) => {
    const item = sections.find(s => s.id === sectionId)?.items.find(i => i.id === itemId);
    if (item) {
      updateItem(sectionId, itemId, {
        correctiveActionTemplates: item.correctiveActionTemplates.filter((_, i) => i !== index)
      });
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">ISO Checklist Configuration</h1>
          <p className="text-gray-600 mt-2">Configure ISO 9001 audit checklist sections and items</p>
        </div>
        {!readOnly && (
          <div className="flex gap-3">
            <button
              onClick={addSection}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Add Section
            </button>
            <button
              onClick={handleSaveChecklist}
              disabled={loading}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Configuration'}
            </button>
          </div>
        )}
      </div>

      {message && (
        <div className={`mb-4 p-4 rounded-lg ${
          message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
        }`}>
          {message.text}
        </div>
      )}

      <div className="space-y-6">
        {sections.map((section, sectionIndex) => (
          <div key={section.id} className="bg-white rounded-lg shadow-md border border-gray-200">
            <div className="p-4 bg-gray-50 border-b border-gray-200">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  {editingSection === section.id && !readOnly ? (
                    <div className="space-y-3">
                      <input
                        type="text"
                        value={section.title}
                        onChange={(e) => updateSection(section.id, { title: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        placeholder="Section Title"
                      />
                      <input
                        type="text"
                        value={section.clauseRange}
                        onChange={(e) => updateSection(section.id, { clauseRange: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        placeholder="Clause Range (e.g., 4.1-4.4)"
                      />
                      <button
                        onClick={() => setEditingSection(null)}
                        className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                      >
                        Done
                      </button>
                    </div>
                  ) : (
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">
                        {sectionIndex + 1}. {section.title}
                      </h2>
                      <p className="text-sm text-gray-600 mt-1">
                        ISO Clause Range: {section.clauseRange} • {section.items.length} items
                      </p>
                    </div>
                  )}
                </div>
                {!readOnly && (
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => setEditingSection(section.id)}
                      className="px-3 py-1 text-blue-600 hover:bg-blue-50 rounded"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => addItem(section.id)}
                      className="px-3 py-1 text-green-600 hover:bg-green-50 rounded"
                    >
                      Add Item
                    </button>
                    <button
                      onClick={() => deleteSection(section.id)}
                      className="px-3 py-1 text-red-600 hover:bg-red-50 rounded"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 space-y-4">
              {section.items.map((item, itemIndex) => (
                <div key={item.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  {editingItem === item.id && !readOnly ? (
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <input
                          type="text"
                          value={item.clauseRef}
                          onChange={(e) => updateItem(section.id, item.id, { clauseRef: e.target.value })}
                          className="px-3 py-2 border border-gray-300 rounded-lg"
                          placeholder="ISO Clause (e.g., 4.1)"
                        />
                        <input
                          type="text"
                          value={item.section}
                          onChange={(e) => updateItem(section.id, item.id, { section: e.target.value })}
                          className="px-3 py-2 border border-gray-300 rounded-lg"
                          placeholder="Section Name"
                        />
                      </div>
                      <textarea
                        value={item.question}
                        onChange={(e) => updateItem(section.id, item.id, { question: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        rows={2}
                        placeholder="Question"
                      />
                      <textarea
                        value={item.helpText}
                        onChange={(e) => updateItem(section.id, item.id, { helpText: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        rows={2}
                        placeholder="Help Text"
                      />
                      <div className="grid grid-cols-3 gap-3">
                        <select
                          value={item.responseType}
                          onChange={(e) => updateItem(section.id, item.id, { responseType: e.target.value as any })}
                          className="px-3 py-2 border border-gray-300 rounded-lg"
                        >
                          <option value="pass_fail_na">Pass/Fail/N/A</option>
                          <option value="numeric">Numeric</option>
                          <option value="text">Text</option>
                        </select>
                        <input
                          type="number"
                          value={item.weight}
                          onChange={(e) => updateItem(section.id, item.id, { weight: parseFloat(e.target.value) })}
                          className="px-3 py-2 border border-gray-300 rounded-lg"
                          placeholder="Weight"
                          step="0.1"
                          min="0"
                        />
                        <label className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg bg-white">
                          <input
                            type="checkbox"
                            checked={item.required}
                            onChange={(e) => updateItem(section.id, item.id, { required: e.target.checked })}
                          />
                          <span>Required</span>
                        </label>
                      </div>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={item.evidenceRequired}
                          onChange={(e) => updateItem(section.id, item.id, { evidenceRequired: e.target.checked })}
                        />
                        <span>Evidence Required</span>
                      </label>
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <label className="font-medium text-sm">Corrective Action Templates</label>
                          <button
                            onClick={() => addCorrectiveActionTemplate(section.id, item.id)}
                            className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                          >
                            Add Template
                          </button>
                        </div>
                        <div className="space-y-2">
                          {item.correctiveActionTemplates.map((template, idx) => (
                            <div key={idx} className="flex gap-2 items-center">
                              <input
                                type="text"
                                value={template}
                                onChange={(e) => {
                                  const newTemplates = [...item.correctiveActionTemplates];
                                  newTemplates[idx] = e.target.value;
                                  updateItem(section.id, item.id, { correctiveActionTemplates: newTemplates });
                                }}
                                className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                              />
                              <button
                                onClick={() => removeCorrectiveActionTemplate(section.id, item.id, idx)}
                                className="px-2 py-1 text-red-600 hover:bg-red-50 rounded text-sm"
                              >
                                Remove
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                      <button
                        onClick={() => setEditingItem(null)}
                        className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                      >
                        Done
                      </button>
                    </div>
                  ) : (
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-semibold text-blue-600">
                              {item.clauseRef}
                            </span>
                            <span className="text-sm text-gray-600">•</span>
                            <span className="text-sm text-gray-600">{item.section}</span>
                            {item.required && (
                              <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded">Required</span>
                            )}
                            {item.evidenceRequired && (
                              <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded">Evidence Required</span>
                            )}
                            <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded">
                              Weight: {item.weight}
                            </span>
                          </div>
                          <p className="text-gray-900 font-medium mb-1">{item.question}</p>
                          <p className="text-sm text-gray-600 italic">{item.helpText}</p>
                          {item.correctiveActionTemplates.length > 0 && (
                            <div className="mt-2">
                              <p className="text-xs font-semibold text-gray-700 mb-1">Corrective Action Templates:</p>
                              <ul className="text-xs text-gray-600 list-disc list-inside space-y-0.5">
                                {item.correctiveActionTemplates.map((template, idx) => (
                                  <li key={idx}>{template}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                        {!readOnly && (
                          <div className="flex gap-2 ml-4">
                            <button
                              onClick={() => setEditingItem(item.id)}
                              className="px-2 py-1 text-xs text-blue-600 hover:bg-blue-50 rounded"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => deleteItem(section.id, item.id)}
                              className="px-2 py-1 text-xs text-red-600 hover:bg-red-50 rounded"
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
              {section.items.length === 0 && (
                <p className="text-gray-500 text-center py-4">No items in this section</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {sections.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p className="text-gray-500 mb-4">No checklist sections configured</p>
          {!readOnly && (
            <button
              onClick={addSection}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Add First Section
            </button>
          )}
        </div>
      )}
    </div>
  );
}
