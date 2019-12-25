// maybeReformatFault.js
// ------------------------------------------------------------------
//
// maybe format a fault message if one is present.
//
// created: Tue Jan 26 14:07:19 2016
// last saved: <2016-June-19 10:38:45>

function copyHash(obj) {
  var copy = {};
  if (null !== obj && typeof obj == "object") {
    Object.keys(obj).forEach(function(attr){copy[attr] = obj[attr];});
  }
  return copy;
}

var handled = context.getVariable('fault_handled');
print('handled:\'' + handled + '\'');
if ( ! handled ) {
  try {
    print('parse content.');
    var c = JSON.parse(context.getVariable('message.content'));

    print('c2 : ' + JSON.stringify(c));
    
    // modify c here.

    // example input:
    // {
    // "fault": {
    //   "faultstring": "Access Token expired",
    //   "detail": {
    //     "errorcode": "keymanagement.service.access_token_expired"
    //   }
    // }    

    // example output:
    // {
    //   "error": {
    //     "message": "Access Token expired",
    //     "detail": {
    //       "errorcode": "400",
    //       "info": "Contact: support@support.com"
    //     }
    //   }
    // }
    
    if (c.fault) {
      c.error = copyHash(c.fault);
      delete c.fault;
      if ( ! c.error.detail) {
        c.error.detail = {};
      }
      if (c.error.faultstring) {
        c.error.message = c.error.faultstring;
        delete c.error.faultstring;
      }
      c.error.detail.errorcode = context.getVariable('message.status.code');
      c.error.detail.info = "Contact: support@support.com";
      // finally, put the hash back into response content:
      // context.setVariable('response.content', JSON.stringify(c));

      // or, prettified:
      context.setVariable('message.content', JSON.stringify(c, null, 2)+'\n');
      context.setVariable('fault_handled', true);
    }
  }
  catch (e) {
    // perhaps the original fault was not JSON, could not be parsed
    print('exception:' + JSON.stringify(e));
    context.setVariable('reformat_exception', e);
  }
}
