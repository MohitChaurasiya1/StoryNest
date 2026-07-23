import React from 'react';
import { FaPlus, FaChild } from 'react-icons/fa';
import './ChildSelector.css';

export default function ChildSelector({ childrenList, activeChildId, onSelectChild, onOpenAddModal }) {
  return (
    <div className="child-selector-container">
      <div className="child-selector-pills">
        {childrenList.map((child) => {
          const isActive = child.id === activeChildId;
          return (
            <button
              key={child.id}
              onClick={() => onSelectChild(child.id)}
              className={`child-pill ${isActive ? 'active' : ''}`}
            >
              <span className="child-avatar">{child.avatar || '👦'}</span>
              <span className="child-name">{child.name}</span>
            </button>
          );
        })}

        <button
          onClick={onOpenAddModal}
          className="btn-add-child"
          title="Add new child profile"
        >
          <FaPlus /> Add Child
        </button>
      </div>
    </div>
  );
}
