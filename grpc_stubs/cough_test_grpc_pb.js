// GENERATED CODE -- DO NOT EDIT!

'use strict';
var grpc = require('grpc');
var cough_test_pb = require('./cough_test_pb.js');

function serialize_covid_Audio(arg) {
  if (!(arg instanceof cough_test_pb.Audio)) {
    throw new Error('Expected argument of type covid.Audio');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_covid_Audio(buffer_arg) {
  return cough_test_pb.Audio.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_covid_Text(arg) {
  if (!(arg instanceof cough_test_pb.Text)) {
    throw new Error('Expected argument of type covid.Text');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_covid_Text(buffer_arg) {
  return cough_test_pb.Text.deserializeBinary(new Uint8Array(buffer_arg));
}


var COVIDService = exports.COVIDService = {
  s2t: {
    path: '/covid.COVID/s2t',
    requestStream: false,
    responseStream: false,
    requestType: cough_test_pb.Audio,
    responseType: cough_test_pb.Text,
    requestSerialize: serialize_covid_Audio,
    requestDeserialize: deserialize_covid_Audio,
    responseSerialize: serialize_covid_Text,
    responseDeserialize: deserialize_covid_Text,
  },
};

exports.COVIDClient = grpc.makeGenericClientConstructor(COVIDService);
