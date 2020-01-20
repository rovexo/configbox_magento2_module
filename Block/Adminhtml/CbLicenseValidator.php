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
    protected $authSession;

    protected $backendUrl;

    protected $formKey;

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
        array $data = []
    ) {
        parent::__construct($context, $data);
        $this->authSession = $authSession;
        $this->backendUrl = $backendUrl;
        $this->formKey = $formKey;
    }

    /**
     * Check if admin is logged in
     *
     * @return bool
     */
    public function isAdminLoggedIn()
    {
        return $this->authSession->isLoggedIn();
    }

    /**
     * Check if CB License is expired
     *
     * @return bool
     * @throws Exception
     */
    public function isCbLicenseExpired()
    {
        try{
            $cbAdminDashboard = KenedoModel::getModel('ConfigboxModelAdmindashboard');
            return $cbAdminDashboard->isLicenseExpired();

        }
        catch(\Exception $e){

        }
    }

    /**
     * Get License URL
     *
     * @return string
     */
    public function getLicenseUrl()
    {
        $params = [
            'option' => 'com_configbox',
            'controller' => 'adminlicense',
            'form_key' => $this->formKey->getFormKey()
        ];
        return $this->backendUrl->getUrl('configbox/admin/index', $params);
    }
}
