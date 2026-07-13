import { useState } from 'react';
import { Link } from 'react-router-dom';
import { completeExercise, markDatasetProgress } from '../lib/learningApi.js';
import { openInLab } from '../lib/labLink.js';

const DIFFICULTY_COLOR = { beginner: '#00c4a0', intermediate: '#e3b341', advanced: '#ff6b6b' };

function ExerciseRow({ exercise, dataset, completed, isSignedIn, onCompleted }) {
  const [expanded, setExpanded] = useState(false);
  const [completing, setCompleting] = useState(false);

  async function handleOpenInLab() {
    if (isSignedIn) await markDatasetProgress(dataset.id, 'started');
    openInLab({
      workflowId: exercise.starter_config?.workflowId,
      datasetSlug: dataset.slug,
      datasetTitle: dataset.title,
      exerciseId: exercise.id,
      exerciseTitle: exercise.title,
      starterConfig: exercise.starter_config,
    });
  }

  async function handleMarkComplete() {
    if (completing || completed) return;
    setCompleting(true);
    await completeExercise(exercise.id);
    setCompleting(false);
    onCompleted();
  }

  return (
    <li className={`learn-exercise ${completed ? 'learn-exercise-done' : ''}`}>
      <div className="learn-exercise-row">
        <div className="learn-exercise-title-wrap">
          <span className="learn-exercise-check">{completed ? '✓' : '○'}</span>
          <button type="button" className="learn-exercise-title" onClick={() => setExpanded((v) => !v)}>
            {exercise.title}
          </button>
        </div>
        <div className="learn-exercise-meta">
          <span className="ds-badge" style={{ color: DIFFICULTY_COLOR[exercise.difficulty], borderColor: DIFFICULTY_COLOR[exercise.difficulty] }}>
            {exercise.difficulty}
          </span>
          <span className="ol-sub">{exercise.points} pts</span>
        </div>
      </div>

      {expanded && (
        <div className="learn-exercise-detail">
          <div className="ds-description">
            {exercise.prompt_md.split('\n').map((line, i) => (
              <p key={i}>{line}</p>
            ))}
          </div>
          <div className="learn-exercise-actions">
            <button type="button" className="ol-btn-ghost" onClick={handleOpenInLab} disabled={!exercise.starter_config?.workflowId}>
              Open in Lab
            </button>
            {isSignedIn && (
              <button type="button" className="ol-btn-primary" onClick={handleMarkComplete} disabled={completed || completing}>
                {completed ? 'Completed' : completing ? 'Saving…' : 'Mark complete'}
              </button>
            )}
          </div>
        </div>
      )}
    </li>
  );
}

export default function LearnPanel({ dataset, learning, exercises, completions, progress, isSignedIn, onProgressChange }) {
  if (!learning && exercises.length === 0) return null;

  async function handleDatasetOpenInLab() {
    if (isSignedIn) await markDatasetProgress(dataset.id, 'started');
    openInLab({
      workflowId: learning?.recommended_workflow_ids?.[0],
      datasetSlug: dataset.slug,
      datasetTitle: dataset.title,
    });
  }

  async function handleExerciseCompleted() {
    await onProgressChange();
  }

  const completedSet = new Set(completions);
  const doneCount = exercises.filter((e) => completedSet.has(e.id)).length;

  return (
    <div className="learn-panel">
      {learning && (
        <>
          {learning.learning_objectives?.length > 0 && (
            <div className="learn-objectives">
              <div className="learn-subhead">You'll learn to</div>
              <ul>
                {learning.learning_objectives.map((o, i) => (
                  <li key={i}>{o}</li>
                ))}
              </ul>
            </div>
          )}
          <div className="learn-meta-row">
            {learning.estimated_minutes && <span>⏱ ~{learning.estimated_minutes} min</span>}
            {learning.prerequisite_skill_tags?.length > 0 && (
              <span>
                Prerequisites:{' '}
                {learning.prerequisite_skill_tags.map((t) => (
                  <span key={t} className="ds-tag" style={{ marginLeft: '0.3rem' }}>
                    {t}
                  </span>
                ))}
              </span>
            )}
          </div>
          {learning.recommended_workflow_ids?.length > 0 && (
            <button type="button" className="ol-btn-primary" onClick={handleDatasetOpenInLab} style={{ marginTop: '0.75rem' }}>
              Open in Lab
            </button>
          )}
        </>
      )}

      {exercises.length > 0 && (
        <>
          <div className="learn-subhead" style={{ marginTop: '1.25rem' }}>
            Exercises ({doneCount}/{exercises.length} complete)
          </div>
          <ul className="learn-exercise-list">
            {exercises.map((ex) => (
              <ExerciseRow
                key={ex.id}
                exercise={ex}
                dataset={dataset}
                completed={completedSet.has(ex.id)}
                isSignedIn={isSignedIn}
                onCompleted={handleExerciseCompleted}
              />
            ))}
          </ul>
          {!isSignedIn && (
            <p className="ol-sub">
              <Link to="/sign-in">Sign in</Link> to track completion and earn points.
            </p>
          )}
        </>
      )}

      {progress?.status === 'completed' && <div className="learn-complete-banner">✓ You've completed this dataset</div>}
    </div>
  );
}
