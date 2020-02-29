<?php

namespace Rovexo\Configbox\Block\Adminhtml;

use Exception;
use KenedoModel;
use Magento\Backend\Model\Auth\Session;
use Magento\Backend\Model\UrlInterface;
use Magento\Framework\Data\Form\FormKey;
use Magento\Framework\View\Element\Template;

/**
 * Class CbLicenseValidator
 *
 * @category Rovexo
 * @package  Rovexo/Configbox
 * @author   Rovexo SIA <office@rovexo.com>
 * @license  https://www.configbox.at/eula ConfigBox License
 * @link     https://www.configbox.at
 */
class CbLicenseValidator extends Template
{
    protected $_authSession;
    protected $_backendUrl;
    protected $_formKey;

    /**
     * CbLicenseValidator constructor.
     *
     * @param Session          $authSession Session object
     * @param Template\Context $context     Context object
     * @param UrlInterface     $backendUrl  Backend URL object
     * @param FormKey          $formKey     FormKey object
     * @param array            $data        Data array
     */
    public function __construct(
        Session $authSession,
        Template\Context $context,
        UrlInterface $backendUrl,
        FormKey $formKey,
        array $data = array()
    ) {
        parent::__construct($context, $data);
        $this->_authSession = $authSession;
        $this->_backendUrl = $backendUrl;
        $this->_formKey = $formKey;
    }

    /**
     * Check if admin is logged in
     *
     * @return bool
     */
    public function isAdminLoggedIn()
    {
        return $this->_authSession->isLoggedIn();
    }

    /**
     * Check if CB License is expired
     *
     * @return bool
     * @throws Exception
     */
    public function isCbLicenseExpired()
    {
        try {
            $cbAdminDashboard = KenedoModel::getModel('ConfigboxModelAdmindashboard');
            return $cbAdminDashboard->isLicenseExpired();
        }
        catch(Exception $e) {
            return false;
        }
    }

    /**
     * Get License URL
     *
     * @return string
     */
    public function getLicenseUrl()
    {
        $params = array(
            'option' => 'com_configbox',
            'controller' => 'adminlicense',
            'form_key' => $this->_formKey->getFormKey()
        );
        return $this->_backendUrl->getUrl('configbox/admin/index', $params);
    }
}
