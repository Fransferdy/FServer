// Copyright 2017 Daniel Parker
// Distributed under the Boost license, Version 1.0.
// (See accompanying file LICENSE_1_0.txt or copy at http://www.boost.org/LICENSE_1_0.txt)

// See https://github.com/danielaparker/jsoncons for latest version

#ifndef JSONCONS_CBOR_CBOR_HPP
#define JSONCONS_CBOR_CBOR_HPP

#include <string>
#include <vector>
#include <memory>
#include <type_traits> // std::enable_if
#include <istream> // std::basic_istream
#include <jsoncons/json.hpp>
#include <jsoncons/json_filter.hpp>
#include <jsoncons/config/binary_detail.hpp>
#include <jsoncons_ext/cbor/cbor_reader.hpp>
#include <jsoncons_ext/cbor/cbor_cursor.hpp>
#include <jsoncons_ext/cbor/cbor_encoder.hpp>
#include <jsoncons/ser_traits.hpp>

namespace jsoncons { namespace cbor {

// encode_cbor

template<class T>
void encode_cbor(const T& j, std::vector<uint8_t>& v)
{
    encode_cbor(j,v,cbor_options::get_default_options());
}

template<class T>
void encode_cbor(const T& j, std::ostream& os)
{
    encode_cbor(j,os,cbor_options::get_default_options());
}

template<class T>
typename std::enable_if<is_basic_json_class<T>::value,void>::type 
encode_cbor(const T& j, std::vector<uint8_t>& v, const cbor_encode_options& options)
{
    typedef typename T::char_type char_type;
    cbor_bytes_encoder encoder(v, options);
    auto adaptor = make_json_content_handler_adaptor<basic_json_content_handler<char_type>>(encoder);
    j.dump(adaptor);
}

template<class T>
typename std::enable_if<!is_basic_json_class<T>::value,void>::type 
encode_cbor(const T& val, std::vector<uint8_t>& v, const cbor_encode_options& options)
{
    cbor_bytes_encoder encoder(v, options);
    write_to(json(), val, encoder);
}

template<class T>
typename std::enable_if<is_basic_json_class<T>::value,void>::type 
encode_cbor(const T& j, std::ostream& os, const cbor_encode_options& options)
{
    typedef typename T::char_type char_type;
    cbor_stream_encoder encoder(os, options);
    auto adaptor = make_json_content_handler_adaptor<basic_json_content_handler<char_type>>(encoder);
    j.dump(adaptor);
}

template<class T>
typename std::enable_if<!is_basic_json_class<T>::value,void>::type 
encode_cbor(const T& val, std::ostream& os, const cbor_encode_options& options)
{
    cbor_stream_encoder encoder(os, options);
    write_to(json(), val, encoder);
}

// decode_cbor 

template<class T>
typename std::enable_if<is_basic_json_class<T>::value,T>::type 
decode_cbor(const std::vector<uint8_t>& v)
{
    jsoncons::json_decoder<T> decoder;
    auto adaptor = make_json_content_handler_adaptor<json_content_handler>(decoder);
    basic_cbor_reader<jsoncons::bytes_source> reader(v, adaptor);
    reader.read();
    return decoder.get_result();
}

template<class T>
typename std::enable_if<!is_basic_json_class<T>::value,T>::type 
decode_cbor(const std::vector<uint8_t>& v)
{
    cbor_bytes_cursor reader(v);
    T val = read_from<T>(json(),reader);
    return val;
}

template<class T>
typename std::enable_if<is_basic_json_class<T>::value,T>::type 
decode_cbor(std::istream& is)
{
    jsoncons::json_decoder<T> decoder;
    auto adaptor = make_json_content_handler_adaptor<json_content_handler>(decoder);
    cbor_stream_reader reader(is, adaptor);
    reader.read();
    return decoder.get_result();
}

template<class T>
typename std::enable_if<!is_basic_json_class<T>::value,T>::type 
decode_cbor(std::istream& is)
{
    cbor_stream_cursor reader(is);
    T val = read_from<T>(json(), reader);
    return val;
}
  
#if !defined(JSONCONS_NO_DEPRECATED)
template<class Json>
JSONCONS_DEPRECATED_MSG("Instead, use encode_cbor(const T&, std::vector<uint8_t>&)")
std::vector<uint8_t> encode_cbor(const Json& j)
{
    std::vector<uint8_t> v;
    encode_cbor(j, v);
    return v;
}
#endif

}}

#endif
