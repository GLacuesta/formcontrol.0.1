// @flow
import { List } from 'immutable';

import type { Action } from 'actions/types';
import type { PriceSummary } from 'api/prices';

export type State = {
  loaded: boolean,
  entities: List<PriceSummary>,
  nextPage: ?string,
  searchTerm: string,
  init: boolean,
  deactivateAllUrl: string,
  list: ?Object,
  details: ?Object,
};

const initialState: State = {
  loaded: false,
  entities: List(),
  nextPage: null,
  searchTerm: '',
  init: false,
  deactivateAllUrl: '',
  list: null,
  details: null
};

export function prices(state: State = initialState, action: Action): State {
  switch (action.type) {
    case 'INIT_PRICES':
      return {
        ...state,
        init: true
      };
    case 'RESET_INIT_PRICES':
      return {
        ...state,
        init: false
      };
    case 'RESET_PRICES':
      return initialState;

    case 'FETCH_PRICES_SUCCESS': {
      if (action.refresh) {
        return {
          ...state,
          loaded: true,
          entities: List(action.items),
          nextPage: action.nextPage,
          deactivateAllUrl: action.deactivateAllUrl
        };
      }
      return {
        ...state,
        loaded: true,
        entities: state.entities.concat(action.items),
        nextPage: action.nextPage,
        deactivateAllUrl: action.deactivateAllUrl
      };
    }
    case 'SET_PRICES_SEARCH_TERM': {
      return {
        ...state,
        searchTerm: action.searchTerm
      };
    }
    case 'SET_PRICES_LIST': {
      return {
        ...state,
        list: action.data
      };
    }
    case 'SET_PRICES_SEARCH': {
      return {
        ...state,
        list: {
          ...state.list,
          item: action.data
        }
      };
    }
    case 'SET_PRICES_FILTER_ENDPOINT': {
      return {
        ...state,
        list: {
          ...state.list,
          updatedAction: action.data
        }
      };
    }
    case 'SET_PRICES_TRANSFER_DETAILS': {
      return {
        ...state,
        details: {
          ...state.details,
          ...action.data
        }
      };
    }
    // case 'SET_PRICES_TRANSFER_DETAILS_ITEMS': {
    //   return {
    //     ...state,
    //     details: {
    //       ...state.details,
    //       item: action.data
    //     }
    //   };
    // }
    // case 'SET_PRICES_TRANSFER_DETAILS_DELIVERIES': {
    //   return {
    //     ...state,
    //     details: {
    //       ...state.details,
    //       deliveries: action.data
    //     }
    //   };
    // }
    case 'BOOTSTRAP_STORE':
      return initialState;
    default:
      return state;
  }
}

export default prices;
