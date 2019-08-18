// @flow
import React from 'react';
// Helper Libs
import moment from 'moment';
import numeral from 'numeral';
import { get } from 'lodash';
import { format } from 'date-fns';
import api from 'utils/api';
import URITemplate from 'uri-templates';
// Components
import LoadableComponent from 'components/loadableComponent';
import Button from 'components/button/button';
import Heading from 'components/heading/heading';
import SortableTable from 'components/sortableTable/sortableTable';
import NoContent from 'components/noContent/noContent';
import StatusIcon from 'components/statusIcon/statusIcon';
import Dropdown from 'components/forms/dropdown';
import { Col, Row } from 'react-flexbox-grid';

// Styles
import styles from './list.css';
import { debouncedFn } from 'containers/utils';
import { mb2 } from 'styles/bass.css';

import type {
  DispatchProps as ListDispatchProps,
  StateProps as ListStateProps,
} from './index';
import type { DispatchProps, StateProps } from '../index';
import type { Options } from '../../../actions/dialog';

type OwnProps = {
  endpoint: string,
  canDeactivateAll: boolean,
  setPrices: Function,
};

type Props = OwnProps &
  ListStateProps &
  ListDispatchProps &
  StateProps &
  DispatchProps;

type OwnState = {
  isLoadingMoreResults: boolean,
  isLoadingSearchResults: boolean,
};

const formatDecimal = value =>
  value != null ? numeral(value).format('0,0.00') : '';

export default class PriceList extends React.Component<Props, OwnState> {
  constructor(props: Props) {
    super(props);

    this.state = {
      isLoadingMoreResults: false,
      isLoadingSearchResults: false,
    };
  }

  static getDerivedStateFromProps(props: Props, state: OwnState) {
    if (props.rows && state.isLoadingSearchResults) {
      return {
        isLoadingSearchResults: false,
      };
    }

    return null;
  }

  componentWillUnmount() {
    this.props.resetPrices();
  }

  deactivatePrice = (
    { fetchPrices, endpoint, deactivatePrice }: Props,
    deactivateURL: string
  ) => () =>
    deactivatePrice(deactivateURL).then(() => fetchPrices(api(), endpoint, ''));

  handleSearch = (value: string) => {
    const { fetchPrices, endpoint, setSearchTerm } = this.props;
    this.setState({ isLoadingSearchResults: true });
    const encodedValue = encodeURIComponent(value);
    setSearchTerm(value);
    return debouncedFn(fetchPrices, api(), endpoint, encodedValue);
  };

  getTableHeaders = (module: string, rows: Array<Object>): Array<Object> => {
    /*
        The API response for Grower doesn't return quantity so
        this is a little check to decide what to render based on the first row
      */
    const growerCheck = get(rows[0], 'quantityPurchased') == null;

    if (growerCheck) {
      return [
        {
          title: <span className={styles.headerIcon} />,
          className: styles.statusColumn,
        },
        { title: 'Buyer Name' },
        { title: 'Location' },
        { title: 'Season' },
        { title: 'Commodity' },
        { title: 'Grade' },
        { title: 'Payment Terms' },
        { title: 'Start Date' },
        { title: 'Price' },
        {
          title: 'Quantity Remaining',
          isRightAligned: true,
          className: styles.priceActionsColumn,
        },
        {
          title: 'Quantity Sold',
          isRightAligned: true,
          className: styles.priceActionsColumn,
        },
      ];
    } else if (module === 'transactions') {
      return [
        {
          title: <span className={styles.headerIcon} />,
          isHiddenOnMobile: true,
          className: styles.statusColumn,
        },
        { title: 'Date', isHiddenOnMobile: true },
        { title: 'Location' },
        { title: 'Season', isHiddenOnMobile: true },
        { title: 'Grade' },
        { title: 'Payment Terms', isHiddenOnMobile: true },
        { title: 'Start Date' },
        { title: 'End Date' },
        { title: 'Price' },
        {
          title: 'Quantity',
          isRightAligned: true,
          isHiddenOnMobile: true,
        },
        {
          title: 'Quantity Purchased',
          isRightAligned: true,
          isHiddenOnMobile: true,
        },
        {
          title: 'Quantity Remaining',
          isRightAligned: true,
          isHiddenOnMobile: true,
        },
        {
          // TODO: DO NOT REPEAT THIS PATTERN OF ADDING BUTTONS TO THE HEADER BEFORE HAVING A CHAT TO THE FRONT-END TEAM
          title: (
            <Button
              disabled={!this.props.canDeactivateAll}
              type="danger"
              size="small"
              inverted
              onClick={this.onDeactivateAllPricesClicked}
            >
              Deactivate All
            </Button>
          ),
          isRightAligned: true,
          isHiddenOnMobile: true,
          className: styles.priceActionsColumn,
        }, // Deactivate Price column
      ];
    } else if (module === 'storage') {
      return [
        {
          title: <span className={styles.headerIcon} />,
          className: styles.statusColumn,
        },
        { title: 'Buyer Name' },
        { title: 'Location' },
        { title: 'Season' },
        { title: 'Grade' },
        { title: 'Payment Terms' },
        { title: 'Created Date' },
        { title: 'Price' },
        {
          title: 'Quantity Purchased',
          isRightAligned: true,
          className: styles.priceActionsColumn,
        },
        {
          title: 'Quantity Remaining',
          isRightAligned: true,
          className: styles.priceActionsColumn,
        },
        {
          title: '',
          isRightAligned: true,
          isHiddenOnMobile: true,
          className: styles.priceActionsColumn,
        },
      ];
    } else {
      return [
        {
          title: <span className={styles.headerIcon} />,
          className: styles.statusColumn,
        },
        { title: 'Buyer Name' },
        { title: 'Location' },
        { title: 'Season' },
        { title: 'Grade' },
        { title: 'Payment Terms' },
        { title: 'Created Date' },
        { title: 'Price' },
        {
          title: 'Quantity Purchased',
          isRightAligned: true,
          className: styles.priceActionsColumn,
        },
        {
          title: 'Quantity Remaining',
          isRightAligned: true,
          className: styles.priceActionsColumn,
        },
      ];
    }
  };

  getTableRows = (module: string, rows: Array<Object>) =>
    rows.map(row => {
      let link = false;
      const status = (
        <div className={styles.statusIconWrapper}>
          <StatusIcon status={row.status} />
        </div>
      );
      const getDate = d => (d ? moment(d).format('DD/MM/YYYY') : d);

      const {
        createdAt,
        startDate: startDateRaw,
        endDate: endDateRaw,
        location,
        buyer,
        creator,
        season,
        grade,
        status: currentStatus,
        deactivateUrl,
        paymentTerm,
        quantityPurchased,
        maxQuantity,
        quantityRemaining,
        quantitySold,
        commodity,
        id
      } = row;
      const date = getDate(createdAt);
      const startDate = getDate(startDateRaw);
      const endDate = getDate(endDateRaw);

      /*
        The API response for Grower doesn't return quantity so
        this is a little check to decide what to render
      */
      const growerCheck = quantityPurchased == null;

      const price = numeral(row.price).format('$0,0.00');
      const deactivateLink =
        currentStatus === 'Inactive' ? (
          'Inactive'
        ) : (
          <Button
            type="danger"
            size="small"
            inverted
            onClick={this.deactivatePrice(this.props, deactivateUrl)}
            disabled={!deactivateUrl}
          >
            Deactivate
          </Button>
          );
      const slug = get(this.props, 'router.params.slug');
      const module = get(this.props, 'router.params.module');
        
      if (growerCheck) {
        return [
          link = `/${slug}/${module}/prices/details/${id}`,
          status,
          creator,
          location,
          season,
          commodity,
          grade,
          paymentTerm,
          date,
          price,
          formatDecimal(quantityRemaining),
          formatDecimal(quantitySold),
        ];
      } else if (module === 'transactions') {
        return [
          link,
          status,
          date,
          location,
          season,
          grade,
          paymentTerm,
          startDate,
          endDate,
          price,
          formatDecimal(maxQuantity),
          formatDecimal(quantityPurchased),
          formatDecimal(quantityRemaining),
          deactivateLink,
        ];
      } else if (module === 'storage') { 
        return [
          link,
          status,
          buyer,
          location,
          season,
          grade,
          paymentTerm,
          date,
          price,
          formatDecimal(quantityPurchased),
          formatDecimal(quantityRemaining),
          deactivateLink,
        ];
      } else {
        return [
          link,
          status,
          buyer,
          location,
          season,
          grade,
          paymentTerm,
          date,
          price,
          formatDecimal(quantityPurchased),
          formatDecimal(quantityRemaining),
        ];
      }
    });

  loadNextPage = () => {
    this.setState({ isLoadingMoreResults: true });

    if (this.props.loadNextPage) {
      this.props
        .loadNextPage()
        .then(() => this.setState({ isLoadingMoreResults: false }));
    }
  };

  onChangeSearchFieldHandler = (key: string, options: ?any = null, event: any) => {
    const searchFieldItem = { ...get(this.props, 'list.item') };
    const endpoint = get(this.props, 'list.action')

    if (this.props.list) {
      if (options) {
        switch (key) {
          case 'grade': {
            (!searchFieldItem['commodity']) ? searchFieldItem['commodity'] = options.find(item => item.id === event.commodityId) : '';
            break;
          }
          case 'commodity': {
            searchFieldItem['grade'] = null;
            break;
          }
        }
      }
      searchFieldItem[key] = event;

      const url = new URITemplate(endpoint).fill({
        buyerId: searchFieldItem.buyer ? searchFieldItem.buyer.id : null,
        commodityId: searchFieldItem.commodity ? searchFieldItem.commodity.id : null,
        gradeId: searchFieldItem.grade ? searchFieldItem.grade.id : null,
        seasonId: searchFieldItem.season ? searchFieldItem.season.id : null,
        locationId: searchFieldItem.location ? searchFieldItem.location.id : null,
      });
      this.props.setPrices(api(), url, searchFieldItem)
    }
  }

  onClickResetAllHandler = () => {
    const item = {
      "buyer": null,
      "commodity": null,
      "grade": null,
      "season": null,
      "location": null
    }
    const endpoint = get(this.props, 'list.action')

    const url = new URITemplate(endpoint).fill({
      buyerId: null,
      commodityId: null,
      gradeId: null,
      seasonId: null,
      locationId: null,
    });
    if (this.props.list) {
      this.props.setPrices(api(), url, item)
    } 
  }

  render() {
    const slug = get(this.props, 'router.params.slug');
    const module = get(this.props, 'router.params.module');
    const exportName = `prices-${format(Date.now(), 'YYYY-MM-DD')}.csv`;
    const header = this.getTableHeaders(module, this.props.rows);
    const rows = this.getTableRows(module, this.props.rows);
    const { isLoadingMoreResults, isLoadingSearchResults } = this.state;
    const loaded = this.props.loaded;
    const endpoint = get(this.props, 'endpoint');
    let fiveSearchField = null;
    const searchFieldOptions = get(this.props, 'list.options');
    const searchFieldItem = get(this.props, 'list.item');
    const filterEndpoint = get(this.props, 'list.updatedAction');
    const loadExportDataArguments = [api(), module, this.props.searchTerm, endpoint.includes(`v1/growers/`) ? filterEndpoint : null];

    if (endpoint.includes(`v1/growers/`) && this.props.list) {
      const gradeOptions = searchFieldItem.commodity
        ? searchFieldOptions.grades.filter(item => item.commodityId === searchFieldItem.commodity.id)
        : searchFieldOptions.grades;
      fiveSearchField =
        <div className={styles.searchFieldWrapper}>
          <Row className={mb2}>
            <Col md={2} xs={2}>
              <Dropdown
                id="commodity"
                label="Commodity"
                name="commodity"
                placeholder="Search. . ."
                value={searchFieldItem.commodity}
                options={searchFieldOptions.commodities}
                onChange={this.onChangeSearchFieldHandler.bind(this, 'commodity', searchFieldOptions.grades)}
              />
            </Col>
            <Col md={2} xs={2}>
              <Dropdown
                id="grade"
                label="Grade"
                name="grade"
                placeholder="Search. . ."
                value={searchFieldItem.grade}
                onChange={this.onChangeSearchFieldHandler.bind(this, 'grade', searchFieldOptions.commodities)}
                options={gradeOptions}
              />
            </Col>
            <Col md={2} xs={2}>
              <Dropdown
                id="season"
                label="Season"
                name="season"
                placeholder="Search. . ."
                value={searchFieldItem.season}
                onChange={this.onChangeSearchFieldHandler.bind(this, 'season', null)}
                options={searchFieldOptions.seasons}
              />
            </Col> 
          </Row>
          <Row className={mb2}>
            <Col md={3} xs={3}>
              <Dropdown
                id="location"
                label="Location"
                name="location"
                placeholder="Search. . ."
                value={searchFieldItem.location}
                onChange={this.onChangeSearchFieldHandler.bind(this, 'location', null)}
                options={searchFieldOptions.locations}
              />
            </Col>
            <Col md={3} xs={3}>
              <Dropdown
                id="buyer"
                label="Buyer"
                name="buyer"
                placeholder="Search. . ."
                value={searchFieldItem.buyer}
                onChange={this.onChangeSearchFieldHandler.bind(this, 'buyer', null)}
                options={searchFieldOptions.buyers}
              />
            </Col>
            <Col md={2} xs={2}>
              <Button className={styles.resetWrapper} onClick={this.onClickResetAllHandler}>Reset All</Button>
            </Col>
          </Row>
        </div>;
    }

    return (
      <section data-im="priceList">
        <header className="viewHeading">
          <Heading title="Prices" hasBackArrow={false} />
          {this.props.createUrl && (
            <Button to={`/${slug}/${module}/prices/create`} type="create">
              New price
            </Button>
          )}
        </header>

        {fiveSearchField}

        <LoadableComponent loaded={loaded}>
          {() => {
            if (rows.length < 1 && !this.props.searchTerm) {
              return (
                <div className={styles.tableWrapper}>
                  <NoContent
                    title="There are currently no prices to display"
                    linkTitle="Create a new price"
                    link={
                      this.props.createUrl
                        ? `/${slug}/${module}/prices/create`
                        : null
                    }
                  />
                </div>
              );
            } else {
              return (
                <div className={endpoint.includes(`v1/growers/`) ? styles.growerTableWrapper : styles.tableWrapper}>
                  <SortableTable
                    header={header}
                    rows={rows}
                    exportVisible={true}
                    exportName={exportName}
                    loadExportData={this.props.loadExportData}
                    loadExportDataArguments={loadExportDataArguments}
                    searchVisible={!endpoint.includes(`v1/growers/`)}
                    handleInputSearch={this.handleSearch}
                    isLoadingSearchResults={isLoadingSearchResults}
                    searchTerm={this.props.searchTerm}
                    overrideClassNames={{
                      sortableTableWrapper: styles.priceTable,
                    }}
                  />
                  {this.props.nextPage && (
                    <div className={styles.nextPageButtonWrapper}>
                      <Button
                        onClick={this.props.loadNextPage}
                        isLoading={isLoadingMoreResults}
                      >
                        Load more results
                      </Button>
                    </div>
                  )}
                </div>
              );
            }
          }}
        </LoadableComponent>
      </section>
    );
  }

  onDeactivateAllPricesClicked = () => {
    const options: Options = {
      title: 'Deactivate cash prices',
      message:
        'Are you sure you want to deactivate all active cash prices? This action cannot be undone.',
      cancel: {
        text: 'Cancel',
        action: '',
      },
      confirm: {
        action: () =>
          this.props.onConfirmDeactivateAll(
            this.props.endpoint,
            this.props.searchTerm
          ),
        type: 'danger',
        text: 'Deactivate all',
      },
    };

    this.props.showDeactivateAllDialog(options);
  };
}
