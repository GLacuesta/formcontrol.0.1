// @flow
import { curry, get } from 'lodash/fp';
import type { PriceSummary } from 'api/prices';
import { deserializePriceList } from 'api/prices';
import { showAlert } from './alert';
import { addEndpoint } from './endpoints';
import { exportData } from './export';
import { hideDialog, updateConfirm } from './dialog';

import type { Axios } from 'axios';
import type { Action } from './types';
import type { Dispatch, ThunkAction } from 'store';

import parsePricesCsv from 'utils/blobs/parsePricesCsv';

export const INITIAL_VALUES_ENDPOINT = 'PricesCreate.initialValuesEndpoint';

export const fetchPrices = (refresh: boolean = true): Action => ({
  type: 'FETCH_PRICES',
  refresh
});

export const fetchPricesSuccess = (
  items: PriceSummary[],
  nextPage: ?string,
  refresh: boolean = true,
  deactivateAllUrl: string
): Action => ({
  type: 'FETCH_PRICES_SUCCESS',
  items,
  nextPage,
  refresh,
  deactivateAllUrl
});

export const setSearchTerm = (searchTerm: string): Action => ({
  type: 'SET_PRICES_SEARCH_TERM',
  searchTerm
});

export const fetchPricesFailure = (error: string): Action => ({
  type: 'FETCH_PRICES_FAILURE',
  error
});

export const searchParam: string = 'searchTerm';

export const deactivatePrice = curry(
  (client: Axios, endpoint: string): ThunkAction => (dispatch: Dispatch) => {
    return client.delete(endpoint).then(response => {
      if (response.status === 200) {
        dispatch(showAlert('Price has been set to inactive.', 'success'));
      } else {
        dispatch(
          showAlert(
            'An error occurred while trying to deactivate the price. Please try again.',
            'error'
          )
        );
      }
    });
  }
);

export const init = (): Action => ({ type: 'INIT_PRICES' });
export const resetInit: Action = { type: 'RESET_INIT_PRICES' };
export const resetPrices: Action = { type: 'RESET_PRICES' };

export const requestPrices = curry(
  (
    refresh: boolean,
    client: Axios,
    endpoint: ?string,
    searchTerm: string = ''
  ): ThunkAction => async dispatch => {
    if (!endpoint) {
      return;
    }

    dispatch(fetchPrices(refresh));
    dispatch(resetInit);
    try {
      const searchString =
        endpoint.includes(searchParam) || !searchTerm
          ? ''
          : `?${searchParam}=${searchTerm}`;

      const { data } = await client.get(endpoint + searchString);

      localStorage.setItem(INITIAL_VALUES_ENDPOINT, data.createUrl); // @TODO remove me
      let mod = 'transactions';
      if (data.createUrl) {
        mod = endpoint.includes('site-operators') ? 'storage' : mod; // @TODO for intensive review
      }
      dispatch(addEndpoint(data.createUrl, [mod, 'create_price']));

      const { items, nextPage, deactivateAllUrl } = deserializePriceList(data);
      dispatch(fetchPricesSuccess(items, nextPage, refresh, deactivateAllUrl));
      return true;
    } catch (error) {
      showAlert("Couldn't fetch prices", 'error', false)(dispatch);
      dispatch(fetchPricesFailure(error));
    }
  }
);

export const loadNextPageOfPrices = (client: Axios): ThunkAction => (
  dispatch,
  getState
) => {
  const endpoint = getState().prices.nextPage;
  return dispatch(requestPrices(false, client, endpoint));
};

export const loadExportData = (
  client: Axios,
  module: string,
  searchTerm: string,
  growerEndpoint: ?string,
): ThunkAction => (dispatch, getState) => {
  const state = getState();
  const endpoint = growerEndpoint ? growerEndpoint : get(`${module}.prices`, state.endpoints);
  return endpoint
    ? exportData(client, parsePricesCsv(module), endpoint, searchTerm)(
        dispatch,
        getState
      )
    : null;
};

export const deactivateAllPricesForBuyer = (
  client: Axios,
  endpoint: string,
  searchTerm: string
): ThunkAction => async (dispatch, getState) => {
  dispatch(updateConfirm({ isLoading: true }));

  try {
    await client.delete(getState().prices.deactivateAllUrl);
    showAlert('All active prices successfully deactivated', 'success', true)(
      dispatch
    );
  } catch (error) {
    if (error.response.status === 400) {
      showAlert('No active prices exist', 'error', true)(dispatch);
    } else {
      showAlert(
        'An error occurred while trying to deactivate all cash prices',
        'error',
        true
      )(dispatch);
    }
  }

  dispatch(requestPrices(true, client, endpoint, searchTerm));
  dispatch(hideDialog());
};

export const fetchPricesList = curry(
  (
    client: Axios,
    endpoint: ?string,
  ): ThunkAction => async dispatch => {
    if (!endpoint) {
      return;
    }

    try {
      const { data } = await client.get(endpoint);
      const action = data.action.replace(`{?buyerId,commodityId,gradeId,seasonId,locationId,numberOfItems,page}`, '');
      dispatch(setPricesList(data));
      dispatch(requestPrices(true, client, action));
      dispatch(setPricesFilterEndpoint(action));
      return true;
    } catch (error) {
      showAlert("Couldn't fetch prices", 'error', false)(dispatch);
      dispatch(fetchPricesFailure(error));
    }
  }
);

export const setPrices = curry(
  (
    client: Axios,
    endpoint: ?string,
    data: Object,
  ): ThunkAction => async dispatch => {

    try {
      dispatch(setPricesSearch(data));
      dispatch(requestPrices(true, client, endpoint));
      dispatch(setPricesFilterEndpoint(endpoint));
      return true;
    } catch (error) {
      showAlert("Couldn't fetch prices", 'error', false)(dispatch);
      dispatch(fetchPricesFailure(error));
    }
  }
);

export const fetchPricesDetails = curry(
  (
    client: Axios,
    endpoint: string,
  ): ThunkAction => async dispatch => {

    try {
      const { data } = await client.get(endpoint);
      dispatch(setPricesTransferDetails(data));
      dispatch(setPricesTransferDetailsItem(data));
      // dispatch(setPricesTransferDetails(data));
      return true;
    } catch (error) {
      showAlert("Couldn't fetch prices", 'error', false)(dispatch);
      dispatch(fetchPricesFailure(error));
    }
  }
);

export const setPricesList = (data: Object): Action => {
  return {
    type: 'SET_PRICES_LIST',
    data: data
  }
};

export const setPricesSearch = (data: Object): Action => {
  return {
    type: 'SET_PRICES_SEARCH',
    data: data
  }
};

export const setPricesFilterEndpoint = (data: ?string): Action => {
  return {
    type: 'SET_PRICES_FILTER_ENDPOINT',
    data: data
  }
};

export const setPricesTransferDetails = (data: ?Object): Action => {
  return {
    type: 'SET_PRICES_TRANSFER_DETAILS',
    data: data
  }
};

export const setPricesTransferDetailsItem = (data: ?Object): Action => {
  return {
    type: 'SET_PRICES_TRANSFER_DETAILS',
    data: data
  }
};

// export const setPricesTransferDetailsDeliveries = (data: ?Object): Action => {
//   return {
//     type: 'SET_PRICES_TRANSFER_DETAILS_DELIVERIES',
//     data: data
//   }
// };