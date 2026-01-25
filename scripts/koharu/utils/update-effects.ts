import type { Dispatch } from 'react';
import { UPSTREAM_URL, type UpdateAction, type UpdateState, type UpdateStatus } from '../constants/update';
import {
  checkGitStatus,
  ensureUpstreamRemote,
  fetchUpstream,
  getUpdateInfo,
  hasUpstreamTrackingRef,
  installDeps,
  mergeUpstream,
} from './update-operations';

/** Effect function type: receives current state and dispatch, may return a cleanup function */
type EffectFn = (state: UpdateState, dispatch: Dispatch<UpdateAction>) => (() => void) | undefined;

/**
 * State side-effect mapping
 * Each state that requires side effects maps to an effect function
 */
export const statusEffects: Partial<Record<UpdateStatus, EffectFn>> = {
  checking: (state, dispatch) => {
    try {
      const gitStatus = checkGitStatus();
      const { checkOnly } = state.options;

      // Ensure upstream remote exists
      const upstream = ensureUpstreamRemote({ allowAdd: !checkOnly });
      if (!upstream.success) {
        if (upstream.reason === 'mismatch') {
          const currentUrl = upstream.currentUrl ?? 'unknown';
          dispatch({
            type: 'ERROR',
            error: `Upstream already exists but points to ${currentUrl}. Please update it to ${UPSTREAM_URL}`,
          });
          return undefined;
        }
        if (upstream.reason === 'missing' && checkOnly) {
          dispatch({
            type: 'ERROR',
            error: 'Check-only mode will not modify the repo. Please add upstream manually or run without --check.',
          });
          return undefined;
        }
        dispatch({ type: 'ERROR', error: 'Unable to add upstream remote' });
        return undefined;
      }

      dispatch({ type: 'GIT_CHECKED', payload: gitStatus });
    } catch (err) {
      dispatch({ type: 'ERROR', error: err instanceof Error ? err.message : String(err) });
    }
    return undefined;
  },

  fetching: (state, dispatch) => {
    try {
      if (state.options.checkOnly) {
        if (!hasUpstreamTrackingRef()) {
          dispatch({
            type: 'ERROR',
            error: 'Check-only mode will not run git fetch. Please run git fetch upstream manually.',
          });
          return undefined;
        }
      } else {
        const success = fetchUpstream();
        if (!success) {
          dispatch({ type: 'ERROR', error: 'Unable to fetch upstream updates. Please check your network connection.' });
          return undefined;
        }
      }
      const info = getUpdateInfo();
      dispatch({ type: 'FETCHED', payload: info });
    } catch (err) {
      dispatch({ type: 'ERROR', error: err instanceof Error ? err.message : String(err) });
    }
    return undefined;
  },

  merging: (_state, dispatch) => {
    const result = mergeUpstream();
    dispatch({ type: 'MERGED', payload: result });
    return undefined;
  },

  installing: (_state, dispatch) => {
    let cancelled = false;

    installDeps()
      .then((result) => {
        if (cancelled) return;
        if (!result.success) {
          dispatch({ type: 'ERROR', error: `Dependency installation failed: ${result.error}` });
          return;
        }
        dispatch({ type: 'INSTALLED' });
      })
      .catch((err) => {
        if (cancelled) return;
        dispatch({ type: 'ERROR', error: err instanceof Error ? err.message : String(err) });
      });

    // Return cleanup function to avoid state updates after unmount
    return () => {
      cancelled = true;
    };
  },
};
