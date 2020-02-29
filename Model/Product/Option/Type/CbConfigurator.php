<?php

namespace Rovexo\Configbox\Model\Product\Option\Type;

use Exception;
use KenedoModel;
use Magento\Catalog\Model\Product\Option\Type\DefaultType;
use Magento\Checkout\Model\Session;
use Magento\Framework\App\Config\ScopeConfigInterface;
use Magento\Framework\DataObject;
use Magento\Framework\Exception\LocalizedException;
use Magento\Store\Model\ScopeInterface;

/**
 * Class CbConfigurator
 *
 * @category Rovexo
 * @package  Rovexo/Configbox
 * @author   Rovexo SIA <office@rovexo.com>
 * @license  https://www.configbox.at/eula ConfigBox License
 * @link     https://www.configbox.at
 */
class CbConfigurator extends DefaultType
{
    protected $_scopeConfig;

    /**
     * CbConfigurator constructor.
     *
     * @param Session              $checkoutSession Session object
     * @param ScopeConfigInterface $scopeConfig     ScopeConfig object
     * @param array                $data            Data array
     */
    public function __construct(
        Session $checkoutSession,
        ScopeConfigInterface $scopeConfig,
        array $data = array()
    ) {
        $this->_scopeConfig = $scopeConfig;
        parent::__construct($checkoutSession, $scopeConfig, $data);
    }

    /**
     * Get option price
     *
     * @param string $configInfoJson config info as JSON
     * @param float  $basePrice      Base price
     *
     * @return float
     * @throws Exception
     */
    public function getOptionPrice($configInfoJson, $basePrice)
    {
        $configInfo = json_decode($configInfoJson, true);

        $includingTax = $this->_scopeConfig->getValue(
            'tax/calculation/price_includes_tax',
            ScopeInterface::SCOPE_STORE
        );

        if ($includingTax) {
            $price = $configInfo['totalGross'];
        } else {
            $price = $configInfo['totalNet'];
        }

        return $price;
    }

    /**
     * Get option SKU
     *
     * @param string $configInfoJson  Configuration Info as JSON string
     * @param string $skuDelimiter    SKU delimiter
     *
     * @return string
     */
    public function getOptionSku($configInfoJson, $skuDelimiter)
    {
        $configInfo = json_decode($configInfoJson, true);
        $sku = implode($skuDelimiter, $configInfo['skus']);
        return $sku;
    }

    /**
     * Validate user input for option
     *
     * @param array $allOptions Array of all options
     *
     * @return $this
     */
    public function validateUserValue($allOptions)
    {
        if (!$this->getSkipCheckRequiredOption()) {
            $optionId = $this->getOption()->getId();
            $configInfo = json_decode($allOptions[$optionId], true);

            if (!isset($configInfo) || !isset($configInfo['position_id'])) {
                $this->setData('is_valid', false);
                throw new LocalizedException(
                    __('Please make a selection for all required selections')
                );
            }

            $model = KenedoModel::getModel('ConfigboxModelCartposition');
            $model->setId($configInfo['position_id'], false);
            $missing = $model->getMissingSelections();

            if (!empty($missing)) {
                $this->setData('is_valid', false);

                $missingQuestions = array();
                foreach ($missing as $missingElement) {
                    $missingQuestions[] = \KText::_($missingElement['title']);
                }

                $msg = 'Before finishing the configuration you have to make a choice for these required elements:';
                $errorMessage = \KText::_($msg);
                $errorMessage .= implode(', ', $missingQuestions);
                throw new LocalizedException(new \Magento\Framework\Phrase($errorMessage));
            }
        }

        $this->setData('is_valid', true);
        return $this;
    }

    /**
     * Set request
     *
     * @param DataObject $buyRequest Buyrequest object
     *
     * @return $this
     */
    public function setRequest($buyRequest)
    {
        $optionId = $this->getOption()->getId();
        $options = $buyRequest->getData('options');
        $this->setData('user_value', $options[$optionId]);
        return $this;
    }

    /**
     * Prepare the configuration text display in the cart page
     *
     * @return mixed Prepared option value
     */
    public function prepareForCart()
    {
        return $this->getData('user_value');
    }

    /**
     * Prepare option value
     *
     * @param string $optionValue Option value
     *
     * @return string|null
     */
    public function prepareOptionValueForRequest($optionValue)
    {
        return $optionValue;
    }

    /**
     * Get printable option value
     *
     * @param string $value Value
     *
     * @return string
     */
    public function getPrintableOptionValue($value)
    {
        return $this->getFormattedOptionValue($value);
    }

    /**
     * Return the configuration text for all kinds of pages
     *
     * @param string $configInfoJson
     *
     * @return string
     */
    public function getFormattedOptionValue($configInfoJson)
    {
        $configInfo = json_decode($configInfoJson, true);

        if (function_exists('overrideGetFormattedOptionValue')) {
            $response = overrideGetFormattedOptionValue($configInfo);
            if ($response !== null) {
                return $response;
            }
        }

        return $configInfo['formattedOptionValue'];
    }
}
