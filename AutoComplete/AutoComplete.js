import React, { Component } from 'react'
import PropTypes from 'prop-types';
import { TouchableHighlight, Text, TextInput, View, ScrollView } from 'react-native'
import stringScore from 'string_score'
import Styles from './Styles'
class AutoComplete extends Component {
  componentDidMount () {
    this.suggestions = this.filterSugestions(
      this.props.suggestions, this.props.value
    )
  }

  componentWillUpdate (nextProps, nextState) {
    this.suggestions = this.filterSugestions(
      nextProps.suggestions, nextProps.value
    )
  }

  getSuggestionText = (suggestion) => {
    if (this.props.suggestionObjectTextProperty) {
      return suggestion[this.props.suggestionObjectTextProperty]
    }

    return suggestion
  }

  isSimilar = (value, suggestionText) => {
    if(this.props.allDataOnEmptySearch && !value) {
      return true;
    }
    const suggestionScore = stringScore(
      suggestionText, value, this.props.comparationFuzziness
    )

    return suggestionScore >= this.props.minimumSimilarityScore
  }

  shouldFilterSuggestions = (newSuggestions, value) => {
    return newSuggestions && newSuggestions.length &&
      (this.props.allDataOnEmptySearch || (value && !this.props.allDataOnEmptySearch)) && !this.selectedSuggestion
  }

  filterSugestions = (newSuggestions, value) => {
    if (!this.shouldFilterSuggestions(newSuggestions, value)) {
      return {}
    }

    return newSuggestions.reduce((suggestions, suggestion) => {
      const suggestionText = this.getSuggestionText(suggestion)

      if (!suggestionText || !this.isSimilar(value, suggestionText)) {
        return suggestions
      }

      suggestions[suggestionText] = suggestion
      return suggestions
    }, {})
  }

  onChangeText = (value) => {
    this.selectedSuggestion = false

    if (this.props.onChangeText) {
      this.props.onChangeText(value)
    }
  }

  suggestionClick = (suggestion) => () => {
    this.selectedSuggestion = true
    this.suggestions = {}
    this.props.onSelect(suggestion)
  }

  renderSuggestions = () => {
    const suggestionTexts = Object.keys(this.suggestions || {})

    if (!suggestionTexts.length) {
      return null
    }

    return (
      <ScrollView
        style={this.props.suggestionsWrapperStyle || Styles.suggestionsWrapper}
        {...this.props.scrollViewProps}
      >
        {
          suggestionTexts.map((text, index) => (
            <TouchableHighlight
              key={index}
              suggestionText={text}
              activeOpacity={0.6}
              style={this.props.suggestionStyle || Styles.suggestion}
              onPress={this.suggestionClick(this.suggestions[text])}
              underlayColor='white'
            >
              <Text
                style={this.props.suggestionTextStyle || Styles.suggestionText}
              >
                {text}
              </Text>
            </TouchableHighlight>
          ))
        }
      </ScrollView>
    )
  }

  render () {
    return (
      <View style={this.props.style || Styles.wrapper}>
        <TextInput
          {...this.props}
          onChangeText={this.onChangeText}
          style={this.props.inputStyle || Styles.input}
        />

        {this.renderSuggestions()}
      </View>
    )
  }
}

AutoComplete.propTypes = {
  suggestions: PropTypes.array,
  value: PropTypes.string,
  minimumSimilarityScore: PropTypes.number,
  comparationFuzziness: PropTypes.number,
  suggestionObjectTextProperty: PropTypes.string,
  onChangeText: PropTypes.func,
  onSelect: PropTypes.func.isRequired,
  suggestionsWrapperStyle: PropTypes.any,
  suggestionStyle: PropTypes.any,
  suggestionTextStyle: PropTypes.any,
  style: PropTypes.any,
  inputStyle: PropTypes.any,
  allDataOnEmptySearch: PropTypes.bool,
  scrollViewProps: PropTypes.object,
}

AutoComplete.defaultProps = {
  minimumSimilarityScore: 0.6,
  comparationFuzziness: 0.5,
  allDataOnEmptySearch: false,
  scrollViewProps: {},
}

export default AutoComplete
