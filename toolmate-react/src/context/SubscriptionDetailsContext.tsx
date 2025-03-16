import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import axios from 'axios';
import { UserContext } from './userContext';
import { useToast } from '@/hooks/use-toast';

interface SubscriptionContextType {
  subscriptionData: {
    planName: string;
    subscriptionId: string;
    planLastUpdated: string;
    pricePaid: number;
    planStatus: string;
    nextBillingCycle: string;
    planStartedOn: string;
    lastPaidOn: string;
    cycleExecutionLogs: any[];
  } | null;
  paymentLogs: any[];
  isLoading: boolean;
  error: string | null;
  fetchSubscriptionDetails: (subscriptionId: string) => Promise<void>;
  fetchPaymentLogs: (userId: string) => Promise<void>;
  requestSubscriptionPause: (isDownGradeRequest: boolean, message: "cancel" | "suspend" | "downgrade", downGradeDuration: number) => Promise<boolean>;
  handleRemovePauseSubscription: (message: "cancel" | "suspend" | "downgrade") => Promise<boolean>;
  isRequestSubscriptionPauseLoading: boolean;
  isSuspendRequested: boolean;
  isCancelRequested: boolean;
  isProPlanSubscribed: boolean;
  isSuspended: boolean;
  isCancelSuspendLoading: boolean;
  isCancelCancelLoading: boolean;
  isCancelDowngradeLoading: boolean;
  transactionLogs: any[];
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export const SubscriptionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [subscriptionData, setSubscriptionData] = useState<any>(null);
  const [paymentLogs, setPaymentLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { userData } = useContext(UserContext);
  const [isSuspendRequested, setIsSuspendRequested] = useState(false);
  const [isCancelRequested, setIsCancelRequested] = useState(false);
  const [isProPlanSubscribed, setIsProPlanSubscribed] = useState(false);
  const [isSuspended, setIsSuspended] = useState(false);
  const [isRequestSubscriptionPauseLoading, setIsRequestSubscriptionPauseLoading] = useState(false);
  const [isCancelSuspendLoading, setIsCancelSuspendLoading] = useState(false);
  const [isCancelCancelLoading, setIsCancelCancelLoading] = useState(false);
  const [isCancelDowngradeLoading, setIsCancelDowngradeLoading] = useState(false);
  const [transactionLogs, setTransactionLogs] = useState([]);
  const { toast } = useToast();

  useEffect(() => {
    const handleUserSubscriptionState = () => {
      const lastLog = paymentLogs[0];
      if (lastLog.status === 'suspend request saved to the queue') {
        setIsSuspendRequested(true);
      }
      if (lastLog.status === 'cancel request saved to the queue') {
        setIsCancelRequested(true);
      }
      if (lastLog.status.includes('Subscription SUSPEND')) {
        setIsSuspended(true);
      }
      if (userData?.planAccess[2]) {
        setIsProPlanSubscribed(true);
      }
    };
    if (paymentLogs.length > 0) {
      handleUserSubscriptionState();
    }
  }, [paymentLogs, userData]);


  const handleRemovePauseSubscription = async (message: "cancel" | "suspend" | "downgrade") => {
    if (message === "suspend") {
      setIsCancelSuspendLoading(true);
    }
    if (message === "cancel") {
      setIsCancelCancelLoading(true);
    }
    if (message === "downgrade") {
      setIsCancelDowngradeLoading(true);
    }

    try {
      const response = await axios.post(`${import.meta.env.VITE_SERVER_URL}/api/v1/removeSubscriptionPauseRequest`, {
        subscriptionId: subscriptionData?.subscriptionId,
        userId: userData?.id,
        message
      });

      if (!response.data.success) {
        toast({
          title: "Error",
          description: response.data.message,
          variant: "destructive"
        });
        return false;
      }

      toast({
        title: "Success",
        description: `${message} request removed successfully!`,
        variant: "success"
      });
      if (message === "suspend") {
        setIsSuspendRequested(false);
      }
      if (message === "cancel") {
        setIsCancelRequested(false);
      }
      if (message === "downgrade") {
        setIsProPlanSubscribed(false);
      }
      return true;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
      return false;
    } finally {
      if (message === "suspend") {
        setIsCancelSuspendLoading(false);
      }
      if (message === "cancel") {
        setIsCancelCancelLoading(false);
      }
      if (message === "downgrade") {
        setIsCancelDowngradeLoading(false);
      }

    }
  }



  const fetchSubscriptionDetails = async (subscriptionId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.post(`${import.meta.env.VITE_SERVER_URL}/api/v1/getSubscriptionDetails`, {
        subscriptionId
      });
      console.log(response.data, "responsedd");
      if (!response.data.success) {
        throw new Error(response.data.message);
      }

      const subscription = response.data.subscription;
      const transactionLogs = response.data.transactions;
      setSubscriptionData({
        planName: subscription.planName,
        subscriptionId: subscription.id,
        planLastUpdated: subscription.update_time,
        pricePaid: parseFloat(subscription.billing_info.last_payment.amount.value),
        planStatus: subscription.status,
        nextBillingCycle: subscription.billing_info.next_billing_time,
        planStartedOn: subscription.start_time,
        lastPaidOn: subscription.billing_info.last_payment.time,
        cycleExecutionLogs: subscription.billing_info.cycle_executions
      });
      setTransactionLogs(transactionLogs);
    } catch (err: any) {
      setError(err.message);
    } finally {
      
    }
  };

  const fetchPaymentLogs = async (userId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.post(`${import.meta.env.VITE_SERVER_URL}/api/v1/getSubscriptionLogs`, {
        userId
      });
      if (response.status !== 200) {
        throw new Error("Failed to fetch subscription logs");
      }
      setPaymentLogs(response.data.logs || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const requestSubscriptionPause = async (isDownGradeRequest: boolean, message: "cancel" | "suspend" | "downgrade", downGradeDuration: number) => {
    setIsRequestSubscriptionPauseLoading(true);
    try {
      const response = await axios.post(`${import.meta.env.VITE_SERVER_URL}/api/v1/requestSubscriptionPause`, {
        subscriptionId: subscriptionData?.subscriptionId,
        userId: userData?.id,
        message,
        isDownGradeRequest,
        downGradeDuration
      });

      if (!response.data.success) {
        toast({
          title: "Error",
          description: response.data.message,
          variant: "destructive"
        });
        return false;
      }

      toast({
        title: "Success",
        description: `${message} request sent successfully! ${message} takes effect from next billing cycle | ${new Date(subscriptionData.nextBillingCycle).toDateString()}`,
        variant: "success"
      });

      if (message === "suspend") {
        setIsSuspendRequested(true);
      }
      if (message === "cancel") {
        setIsCancelRequested(true);
      }
      if (message === "downgrade") {
        setIsProPlanSubscribed(false);
      }
      return true;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
      return false;
    } finally {
      setIsRequestSubscriptionPauseLoading(false);
    }
  };

  return (
    <SubscriptionContext.Provider
      value={{
        subscriptionData,
        paymentLogs,
        isLoading,
        error,
        fetchSubscriptionDetails,
        fetchPaymentLogs,
        isSuspendRequested,
        isCancelRequested,
        isProPlanSubscribed,
        requestSubscriptionPause,
        handleRemovePauseSubscription,
        transactionLogs,
        isCancelSuspendLoading,
        isCancelCancelLoading,
        isCancelDowngradeLoading,
        isRequestSubscriptionPauseLoading,
        isSuspended
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
};

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
};
