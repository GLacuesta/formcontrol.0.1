import React from 'react';
import Heading from 'components/heading/heading';
import LoadableComponent from 'components/loadableComponent';
import Dropdown from 'components/forms/dropdown';
// import SortableTable from 'components/sortableTable/sortableTable';
// import TransfersTable from 'components/transfersTable/transfersTable';
import TextArea from 'components/forms/textarea';
import TextField from 'components/forms/textfield';
import SearchField from 'components/forms/searchfield';

import { get } from 'lodash';
import api from 'utils/api';

import { Col, Row } from 'react-flexbox-grid';
import {
  box, boxWrapper,
  formWrapper, 
  // row
} from 'styles/layout.css';
import styles from './details.css';
import { mb2 } from 'styles/bass.css';

class Details extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      transferTypes: [
        { id: 1, name: 'Contract' },
        { id: 2, name: 'Cash' }
      ],
      transferType: null
    }
  }

  componentDidMount() {
    const module = get(this.props, 'router.params.module');
    if (this.props.bootstrapped) {
      const endpoint = get(this.props, `endpoints.${module}.prices`)
      this.props.fetchPricesList(api(), endpoint);
      this.props.init();
    } else {
      const slug = get(this.props, 'router.params.slug');
      this.props.bootstrap({ slug }).then(()=>{
        const endpoint = get(this.props, `endpoints.${module}.prices`)
        this.props.fetchPricesList(api(), endpoint);
        this.props.init();
      });
    }
  }

  componentDidUpdate() {
    console.log('didU', this.props.details)
    if (this.props.details) { return; }
    if (this.props.entities && this.props.entities.length) {
      this.fetchTransferDetails()
    }
  }
  
  fetchTransferDetails() {
    const id = get(this.props, 'router.params.id');
    if (id) {
      const item = this.props.entities.find(price => price.id === parseInt(id));
      this.props.fetchPricesDetails(api(), item.transferLink)
    }
  }

  onChangeTransferTypeHandler = (event) => {
    this.setState({ transferType: event })
  }

  render() {
    const commodity = get(this.props, 'details.item.commodity') || null;
    const commodities = get(this.props, 'details.options.commodities') || [];
    const grade = get(this.props, 'details.item.grade') || null;
    // const grade = get(this.props, 'details.item.grade') || null;
    // const season = get(this.props, 'details.item.season') || null;
    const seasons = get(this.props, 'details.options.seasons') || [];
    // const transferType = get(this.props, 'details.item.transferType') || null;
    const buyer = get(this.props, 'details.item.buyer') || '';
    const buyersEndpoint = get(this.props, 'details.relatedEndpoints.buyers.url') || '';

    let transferTypeRow = null;
    if (this.state.transferType) {
      switch(this.state.transferType.name) {
        case 'Contract': {
          transferTypeRow = (
            <React.Fragment>
              <Row className={mb2}>
                <Col xs={12} md={6}>
                  <SearchField
                    id="buyer"
                    label="Buyer *"
                    name="buyer"
                    placeholder="Find a buyer"
                    value={buyer}
                    disabled={false}
                    error=""
                    // searchParameter="searchTerm"
                    // onChange={e => this.updateFilter(e.target.value,'partner')}
                    endpoint={buyersEndpoint}
                  />
                </Col>
                <Col xs={12} md={6}>
                  <TextField
                    name="refNo"
                    label="Ref No *"
                    placeholder="Enter text..."
                    value={null}
                    // onChange={onChange}
                  />
                </Col>
              </Row>
              <Row className={mb2}>
                <Col xs={12} md={12}>
                  <TextArea
                    name="comment"
                    label="Comment"
                    placeholder="Enter text..."
                    value={null}
                    // onChange={onChange}
                  />
                </Col>
              </Row>
            </React.Fragment>
            );
          break;
        }
        case 'Cash': {
          transferTypeRow = (
            <div></div>
            );
          break;
        }
        default: null
      }
    }

    return (
      <section>
        <header className="viewHeading">
          <Heading title="Price Transfer Details" hasBackArrow={true} />
        </header>
        <LoadableComponent loaded={true}>
          {() => (
            <div>
              <div className={formWrapper}>
                <section className={boxWrapper}>
                <div className={box}>
                  <h1>
                    <span data-im="priceDetails">Price details</span>
                  </h1>
                  <Row className={mb2}>
                    <Col xs={12} md={6}>
                      <Dropdown
                        id="commodity"
                        label="Commodity"
                        name="commodity"
                        placeholder="Search. . ."
                        value={commodity}
                        options={commodities}
                        // onChange={this.onChangeSearchFieldHandler.bind(this, 'commodity', searchFieldOptions.grades)}
                      />
                    </Col>
                    <Col xs={12} md={6}>
                      <Dropdown
                        id="grade"
                        label="Grade"
                        name="grade"
                        placeholder="Search. . ."
                        value={grade}
                        options={[]}
                      // onChange={this.onChangeSearchFieldHandler.bind(this, 'commodity', searchFieldOptions.grades)}
                      />
                    </Col>
                  </Row>
                  <Row className={mb2}>
                    <Col xs={12} md={6}>
                      <Dropdown
                        id="season"
                        label="Season"
                        name="season"
                        placeholder="Search. . ."
                        value={null}
                        options={seasons}
                      // onChange={this.onChangeSearchFieldHandler.bind(this, 'commodity', searchFieldOptions.grades)}
                      />
                    </Col>
                    <Col xs={12} md={6}>
                      <Dropdown
                        id="transferType"
                        label="Transfer Type"
                        name="transferType"
                        placeholder="Search. . ."
                        value={this.state.transferType}
                        options={this.state.transferTypes}
                        onChange={this.onChangeTransferTypeHandler.bind(this)}
                      />
                    </Col>
                  </Row>
                  {transferTypeRow}
                </div>
                </section>
              </div>
              <div className={styles.tableWrapper}>
                <div className={box}>
                  <h1>
                    <span data-im="priceDetails">Deliveries</span>
                  </h1>
                  {/* <SortableTable
                    header={this.state.header}
                    rows={this.state.rows}
                    exportVisible={false}
                    searchVisible={false}
                    hasCheckbox={true}
                    isLoadingSearchResults={false}
                  /> */}

                </div>
              </div>      
            </div>    
          )}
        </LoadableComponent>
      </section>
    );
  }
}

export default Details;