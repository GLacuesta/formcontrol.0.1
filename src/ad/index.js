import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { bootstrap } from 'actions/bootstrap';
import Details from './details';

import { init, fetchPricesList, fetchPricesDetails } from 'actions/prices';



const mapStateToProps = (state) => {
  return {
    endpoints: state.endpoints,
    bootstrapped: state.bootstrapped,
    entities: state.prices.entities.toJS(),
    prices: state.prices,
    details: state.prices.details
  };
}

const mapDispatchToProps = (dispatch) => ({
  ...bindActionCreators(
    {
      bootstrap,
      init,
      fetchPricesList: fetchPricesList(),
      fetchPricesDetails: fetchPricesDetails(),
    },
    dispatch
  )
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Details);
